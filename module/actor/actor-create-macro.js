// added to source for convenience. Latest version embedded in the create character macro in the compendium.

function formResult(input, output) {
    return `<tr><td style='text-align:left'><b>${input}: </b></td><td>${output}</td></tr>`;
}

async function getTableAndRoll(tableName) {
    let thing = await game.tables.entities.find(t => t.name === tableName).roll();
    return thing.results[0].data.text.toLowerCase();
}

async function Create() {
    let allroll = new Roll("3d6[bloodmoon]+3d6[cold]+3d6[force]").roll();

    let strresults = allroll.dice[0].results;
    let refresults = allroll.dice[1].results;
    let charesults = allroll.dice[2].results;

    let strength = strresults[0].result + strresults[1].result + strresults[2].result;
    let reflexes = refresults[0].result + refresults[1].result + refresults[2].result;
    let charisma = charesults[0].result + charesults[1].result + charesults[2].result;

    let hp = new Roll("1d6").roll().total;
    let dollars = new Roll("3d6").roll().total;
    let age = new Roll("3d10+12").roll().total;
    // name
    let maleNamesTable = game.tables.entities.find(t => t.name === "Male Names");
    let femaleNamesTable = game.tables.entities.find(t => t.name === "Female Names");
    let genderRoll = new Roll("1d6").roll().total % 2;
    let firstName = "";
    let genderTable;
    if (genderRoll == 1) {
        genderTable = await maleNamesTable.roll();
    } else {
        genderTable = await femaleNamesTable.roll();
    }
    firstName += genderTable.results[0].data.text;
    const surnameTable = await game.tables.entities.find(t => t.name === "Surnames").roll();
    const nicknameTable = await game.tables.entities.find(t => t.name === "Nicknames").roll();
    const nickname = nicknameTable.results[0].data.text;
    const surname = surnameTable.results[0].data.text;
    // const characterName = firstName + " '" + nickname + "' " + surname;
    const characterName = firstName + " '" + nickname + "' " + surname;
    // former profession - provides background flavour when role playing
    const formerProfession = await getTableAndRoll("Former Professions");
    // biography
    let biography = `<strong>${age}</strong> years old. Previous career was as a ${formerProfession}.`;
    let actorData = {
        name: characterName,
        background: formerProfession,
        biography: biography,
        hp: { value: hp, max: hp },
        dollars: dollars,
        "abilities": {
            "STR": {
                "value": strength,
                "max": strength
            },
            "REF": {
                "value": reflexes,
                "max": reflexes
            },
            "CHA": {
                "value": charisma,
                "max": charisma
            }
        },
    };

    let items = [];

    const data = duplicate(game.items.getName("Rations"));
    data.data.quantity = 2;
    items.push(data);

    const Knapsack = game.items.find(i => i.name === "Knapsack");
    items.push(Knapsack.data);

    async function checkAndGetItemFromSubTable(name) {
        if (SUB_TABLE_NAMES.includes(name)) {
            let subRoll = await game.tables.getName(name).roll();
            let subResults = subRoll.results;
            // console.log("sub: " + subresults[0].data.text);
            return checkAndGetItemFromSubTable(subresults[0].data.text);
        } else {
            return game.items.find(i => i.name === name);
        }
    }

    const TABLE_NAMES = ["Gear", "Weapons"];
    const SUB_TABLE_NAMES = ["Weapons", "Gear"]

    let itemInsert = "";

    TABLE_NAMES.forEach(async tableName => {
        // console.log("table: " + tableName);
        let theRoll = await game.tables.getName(tableName).roll();
        let results = theRoll.results;
        // console.log("main: " + results[0].data.text);

        let item = undefined;

        if (results.length) {
            item = await checkAndGetItemFromSubTable(results[0].data.text);
        }

        if (item) {
            let itemClicker = "@Item[" + item.data.name + "]";
            itemInsert += formResult(tableName, itemClicker);
            items.push(item.data);
        } else {
            itemInsert += formResult(tableName, `None`);
        }
    });

    let actor = await Actor.create({
        name: characterName,
        type: "character",
        img: "icons/svg/mystery-man.svg",
        sort: 12000,
        data: actorData,
        token: {},
        items: items,
        flags: {}
    });

    function postCharToChat() {

        let statInsert = formResult("Strength", strength) +
            formResult("Reflexes", reflexes) +
            formResult("Charisma", charisma) + `</table><table style="width:22%">` +
            formResult("HP", hp) +
            formResult("Dollars", dollars) + "</table>";

        let statsMessage = `<table style="width:32%">${statInsert}</table>`;
        let gearMessage = `<table>${itemInsert}</table>`;
        let bioMessage = biography;

        let charInsert = "@Actor[" + characterName + "]";

        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: `<h2>${charInsert}</h2>` + statsMessage + gearMessage + bioMessage
        };
        ChatMessage.create(chatData, {});
    }

    if (game.dice3d) {
        game.dice3d.showForRoll(allroll).then(happened => {
            postCharToChat();

        });
    } else {
        postCharToChat();
    }

};
Create();