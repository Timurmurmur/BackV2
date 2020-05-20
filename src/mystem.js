var req = [{ "analysis": [], "text": "React" }, { "analysis": [], "text": "Js" }];
var sentense = '';
req.map(function (el1, index) {
    var _a;
    var partOfPredlojeniya = (_a = el1.analysis[0]) === null || _a === void 0 ? void 0 : _a.gr.split('=')[0].split(',')[0];
    console.log(partOfPredlojeniya, el1.text);
    // case 'A':
    //     sentense += el1.text;
    // case 'S':
    //     sentense += el1.text;
    if (partOfPredlojeniya === 'A') {
        sentense += el1.text + ' ';
    }
    else if (partOfPredlojeniya === 'S') {
        sentense += el1.text + ' ';
    }
    else if (partOfPredlojeniya === undefined) {
        sentense += el1.text + ' ';
    }
    else if (partOfPredlojeniya === 'V') {
        sentense += el1.text + ' ';
    }
});
console.log(sentense);
// mystem text.txt --eng-gr --weight --format=json -i > result.json
