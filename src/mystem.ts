import cmd from 'child_process';
import util from 'util';

const exec = util.promisify(cmd.exec);

export const getKeyWords = async (question: string) => {
    let { stdout, stderr } = await exec(`python ./python/mystem.py "${question}"`, { encoding : 'utf-8' });
    let result = JSON.parse(stdout);
    let keywords: string[] = []
    result.map((el: any, index: any) => {
        if (el.analysis !== undefined) {
            let word = el.text;
            const partOfPredlojeniya = el.analysis[0]?.gr.split('=')[0].split(',')[0];
            if (partOfPredlojeniya === 'A') {
                keywords.push(word)
            } else if (partOfPredlojeniya === 'S') {
                keywords.push(word)
            } else if (partOfPredlojeniya === undefined) {
                keywords.push(word)
            } else if (partOfPredlojeniya === 'V') {
                keywords.push(word);
            } else {
            }
        } else {
        }
    })
    return keywords;
}