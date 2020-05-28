import { Term, Definition } from '../db/db';
import { Op } from 'sequelize';


export const addDefinition = async (termin: string[], definition: string) => {
    return await Definition.create({ definition }).then( async (el: any) => {
        for(let term of termin) {
            await Term.create({ definitionId: el.id, termin: term.toLocaleLowerCase() })
        }
    })
}

export const getAllTermins = async (from: number, to: number) => {
    let result:any = [];
    await Term.findAll({ where: { id: {[Op.between]: [from,to]}}})
    .then(async (termins: any) => {
        for(let termin of termins) {
            let definition: any = await Definition.findOne({ where: { id: termin.definitionId }});
            if(definition) {
                result.push(
                    {
                        id: termin.id,
                        termin: termin.termin,
                        definitionId: termin.definitionId,
                        definition: definition.definition
                    }
                )
            }
        }
    });
    return result;
    // Definition.findAll({ include: [{model: Term}]})
}

export const changeTermin = async (termin: string, definition: string) => {
    return await Term.findOne({
        where: {
            termin
        }
    }).then( async (termin: any) => {
        if (termin) {
            await Definition.update({ definition },{where: { id: termin.definitionId }})
            await Term.update({ termin }, { where: termin.id })
        }
    });
}