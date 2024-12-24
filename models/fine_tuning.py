import json
import os
from reward_model import train_reward_model, REWARD_MODEL_NAME
from ppo_updates import run_ppo

HUGGINGFACE_LINKS = {
    'falcon7b': 'tiiuae/falcon-40b',
    'llama7b': 'decapoda-research/llama-7b-hf',
}

def get_models_list():
    # currently exists as fn because we might want to read db to see what models are uploaded
    return ['falcon7b', 'llama7b'] #TODO: find other models, 

if __name__ == '__main__':
    models_list = get_models_list()

    train_reward_model('./data')

    for model_name in models_list:
        run_ppo(HUGGINGFACE_LINKS[model_name], REWARD_MODEL_NAME, f'./data/{model_name}')


    

