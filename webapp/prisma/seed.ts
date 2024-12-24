// @ts-nocheck
// @ts-ignore

import { PrismaClient } from "@prisma/client"
import { set } from "date-fns"

const prisma = new PrismaClient()

function zero(date: Date): Date {
  return set(date, { seconds: 0, milliseconds: 0 })
}


function getModelsList() {
    return ['falcon7b', 'llama7b', 'GPT4', 'Claude', 'BARD', 'GPT3.5'];
}

async function processData() {
    const fs = require('fs');

    if (!fs.existsSync('../data')){
        fs.mkdirSync('../data');
    }

    for (const model of getModelsList()) {
        if (!fs.existsSync(`../data/${model}`)){
            fs.mkdirSync(`../data/${model}`);
        }
    }

    const dbData = await prisma.issue.findMany({
        include: {
            model: true,
            suggestions: true
        }
    });

    console.log(dbData);

    const allPoints = [];
    const allModelsPoints = new Map();

    for (const model of getModelsList()) {
        allModelsPoints.set(model, []);
    }

    for (const line of dbData) {
        const modelName = line.model.name;
        allModelsPoints.get(modelName)?.push(line.triggerPrompt);

        const goodResps = [];
        const badResps = [];

        for (const suggestion of line.suggestions) {
            if (suggestion.evalScore === 0) {
                badResps.push(suggestion.text);
            }
            else {
                goodResps.push(suggestion.text);
            }
        }

        for (const respA of goodResps) {
            for (const respB of badResps) {
                allPoints.push(new Map([
                    ['user_input', line.triggerPrompt],
                    ['completion_a', respA],
                    ['completion_b', respB],
                ]
                ));

            }
        }
    }

    const jsonString = JSON.stringify(allPoints);
    fs.writeFile("../data/reward_training_data.json", jsonString, function(err: Error) {
        if (err) throw err;
        console.log('saved reward training data');
        });

    for (const model of getModelsList()) {
        const jsonString = JSON.stringify(allModelsPoints.get(model));
        fs.writeFile(`../data/${model}/ppo_update_data.json`, jsonString, function(err: Error) {
            if (err) throw err;
            console.log(`saved ppo data for ${model}`);
            });
    }
}

async function main() {
    const llama7b = await prisma.model.upsert({
        where: {
            huggingFaceLink: 'decapoda-research/llama-7b-hf'
        },
        update: {},
        create: {
            name: 'llama7b',
            description: 'LLaMA-7B converted to work with Transformers/HuggingFace. This is under a special license, please see the LICENSE file for details.',
            huggingFaceLink: 'decapoda-research/llama-7b-hf'
        }
    });

    const falcon7b = await prisma.model.upsert({
        where: {
            huggingFaceLink: 'tiiuae/falcon-7b'
        },
        update: {},
        create: {
            name: 'falcon7b',
            description: 'Falcon-7B is a 7B parameters causal decoder-only model built by TII and trained on 1,500B tokens of RefinedWeb enhanced with curated corpora. It is made available under the Apache 2.0 license.',
            huggingFaceLink: 'tiiuae/falcon-7b'
        }
    });


    const gpt4 = await prisma.model.upsert({
        where: {
            huggingFaceLink: 'GPT4'
        },
        update: {},
        create: {
            name: 'GPT4',
            description: 'GPT4',
            huggingFaceLink: 'GPT4'
        }
    });


    const gpt3_5 = await prisma.model.upsert({
        where: {
            huggingFaceLink: 'GPT3.5'
        },
        update: {},
        create: {
            name: 'GPT3.5',
            description: 'GPT3.5',
            huggingFaceLink: 'GPT3.5'
        }
    });


    const claude = await prisma.model.upsert({
        where: {
            huggingFaceLink: 'Claude'
        },
        update: {},
        create: {
            name: 'Claude',
            description: 'Claude',
            huggingFaceLink: 'Claude'
        }
    });

    const bard = await prisma.model.upsert({
        where: {
            huggingFaceLink: 'Bard'
        },
        update: {},
        create: {
            name: 'Bard',
            description: 'Bard',
            huggingFaceLink: 'Bard'
        }
    });

    processData();
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })