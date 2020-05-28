import { Term, Definition } from '../db/db';


export const addDefinition = async (termin: string[], definition: string) => {
    return await Definition.create({ definition }).then( async (el: any) => {
        for(let term of termin) {
            await Term.create({ definitionId: el.id, termin: term.toLocaleLowerCase() })
        }
    })
}

// export const getTerminByTitle = async (title: string) => {
//     return await Termin.findOne({
//         where: {
//             title
//         }
//     });
// }