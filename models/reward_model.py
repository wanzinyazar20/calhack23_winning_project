# falcon_7b

from datasets import load_dataset
from peft import LoraConfig, TaskType, get_peft_model, prepare_model_for_int8_training
from transformers import (
  AutoModelForSequenceClassification,
  AutoTokenizer,
  PreTrainedTokenizerBase,
  Trainer,
  TrainingArguments,
)
import rm_dataloader
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Union
from transformers.utils import PaddingStrategy
import torch
import torch.nn as nn


REWARD_MODEL_NAME = "tiiuae/falcon-40b"

train_hypers = {
    'N_EPOCHS': 1,
    'LR': 1e-4,
    'WEIGHT_DECAY': 0.01,
    'TRAIN_BATCH': 4,
    'EVAL_BATCH': 8,
    'OPTIM': 'adamw_hf'
}

DEFAULT_PAD_TOKEN = "[PAD]"
DEFAULT_EOS_TOKEN = "</s>"
DEFAULT_BOS_TOKEN = "</s>"
DEFAULT_UNK_TOKEN = "</s>"


from huggingface_hub import login
login("your key here!")


@dataclass
class RewardDataCollatorWithPadding:
    tokenizer: PreTrainedTokenizerBase
    padding: Union[bool, str, PaddingStrategy] = True
    max_length: Optional[int] = None
    pad_to_multiple_of: Optional[int] = None
    return_tensors: str = "pt"

    def __call__(self, features: List[Dict[str, Any]]) -> Dict[str, Any]:
        features_j = []
        features_k = []
        for feature in features:
            features_j.append(
                {
                    "input_ids": feature["input_ids_j"],
                    "attention_mask": feature["attention_mask_j"],
                }
            )
            features_k.append(
                {
                    "input_ids": feature["input_ids_k"],
                    "attention_mask": feature["attention_mask_k"],
                }
            )
        batch_j = self.tokenizer.pad(
            features_j,
            padding=self.padding,
            max_length=self.max_length,
            pad_to_multiple_of=self.pad_to_multiple_of,
            return_tensors=self.return_tensors,
        )
        batch_k = self.tokenizer.pad(
            features_k,
            padding=self.padding,
            max_length=self.max_length,
            pad_to_multiple_of=self.pad_to_multiple_of,
            return_tensors=self.return_tensors,
        )
        batch = {
            "input_ids_j": batch_j["input_ids"],
            "attention_mask_j": batch_j["attention_mask"],
            "input_ids_k": batch_k["input_ids"],
            "attention_mask_k": batch_k["attention_mask"],
            "return_loss": True,
        }
        return batch

class RewardTrainer(Trainer):
    # Define how to compute the reward loss. We use the InstructGPT pairwise logloss: https://arxiv.org/abs/2203.02155
    def compute_loss(self, model, inputs, return_outputs=False):
        rewards_j = model(
            input_ids=inputs["input_ids_j"], attention_mask=inputs["attention_mask_j"])[0]
        rewards_k = model(
            input_ids=inputs["input_ids_k"], attention_mask=inputs["attention_mask_k"])[0]
        loss = -nn.functional.logsigmoid(rewards_j - rewards_k).mean()
        if return_outputs:
            return loss, {"rewards_j": rewards_j, "rewards_k": rewards_k}
        return loss


def load_model(model_name):

    tokenizer = AutoTokenizer.from_pretrained(model_name)

    model = AutoModelForSequenceClassification.from_pretrained(
        REWARD_MODEL_NAME,
        num_labels=1,
        load_in_8bit=True,
        torch_dtype=torch.float16,
        trust_remote_code=True,
    )

    model = prepare_model_for_int8_training(model)

    peft_config = LoraConfig(
        task_type=TaskType.SEQ_CLS,
        inference_mode=False,
        target_modules=["query_key_value"],
        r=8,
        lora_alpha=16,
        lora_dropout=0.05,
        bias="none"
    )

    model = get_peft_model(model, peft_config)
    model.gradient_checkpointing_enable()

    tokenizer.pad_token = tokenizer.eos_token
    model.config.pad_token_id = tokenizer.eos_token_id

    return model, tokenizer

def train_reward_model(data_dir: str):
    training_args = TrainingArguments(
        output_dir = "output",
        overwrite_output_dir = True,
        num_train_epochs=train_hypers['N_EPOCHS'],
        learning_rate=train_hypers['LR'],
        weight_decay=train_hypers['WEIGHT_DECAY'],
        fp16=True,
        per_device_train_batch_size = train_hypers['TRAIN_BATCH'],
        per_device_eval_batch_size = train_hypers['EVAL_BATCH'],
        optim=train_hypers['OPTIM'],
        evaluation_strategy="steps",
        eval_steps=400,
        save_strategy="steps",
        save_steps=500,
        save_total_limit=2,
        remove_unused_columns=False,
        logging_strategy="steps",
        logging_steps=10,
        gradient_accumulation_steps = 16,
        gradient_checkpointing = True,
        label_names=[],
        lr_scheduler_type="linear",
    )

    model, tokenizer = load_model(REWARD_MODEL_NAME)
    reward_dataloder = rm_dataloader.RewardDataLoader(data_dir, 3200, 800, 1, tokenizer)
    train_dataset, eval_dataset = reward_dataloder.load_data()

    trainer = RewardTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        data_collator=RewardDataCollatorWithPadding(
            tokenizer=tokenizer, max_length=256, pad_to_multiple_of=8),
    )

    trainer.train()

    torch.save(trainer.model.state_dict(), "falcon_40b.pth")

if __name__ == '__main__':
    train_reward_model(data_dir = 'data')
