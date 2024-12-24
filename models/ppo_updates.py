from datasets import load_dataset
from reward_model import load_model
import torch
import trlx
from trlx.data.default_configs import default_ppo_config

train_hypers = {
  'BATCH_SIZE': 32,
  'TOTAL_STEPS': 300
}

from huggingface_hub import login
login("your key here!")

def get_score(prompt, resp, model, tokenizer):
    encodings = tokenizer(prompt, resp, return_tensors='pt')
    return model(**encodings).logits[0].cuda().detach()

def get_prompts_list(data_dir, model, tokenizer, split = 'train'):
    datas = load_dataset(data_dir, split = split)

    return list(datas['user_input'])

def run_ppo(model_name: str, reward_model_name: str, data_dir: str):
    model, tokenizer = load_model(reward_model_name)
    prompts = get_prompts_list(data_dir, model, tokenizer, split = 'train')
    reward_fn = lambda prompt, resp: get_score(prompt, resp, model, tokenizer)

    config = default_ppo_config().evolve(train=dict(batch_size=train_hypers['BATCH_SIZE'], total_steps=train_hypers['TOTAL_STEPS']))

    new_model = trlx.train(
        model_name,
        prompts=prompts,
        reward_fn=reward_fn,
        config=config,
    ).model

    new_model.push_to_hub(model_name)
