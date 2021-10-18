// Import Modules
import { itbadlandsActor } from './actor/actor.js'
import { itbadlandsActorSheet } from './actor/actor-sheet.js'
import { itbadlandsItem } from './item/item.js'
import { itbadlandsItemSheet } from './item/item-sheet.js'

Hooks.once('init', async function() {
    game.itbadlands = {
        itbadlandsActor,
        itbadlandsItem
    }

    // Define custom Entity classes
    CONFIG.Actor.entityClass = itbadlandsActor
    CONFIG.Item.entityClass = itbadlandsItem

    // Register sheet application classes
    Actors.unregisterSheet('core', ActorSheet)
    Actors.registerSheet('itbadlands', itbadlandsActorSheet, { makeDefault: true })
    Items.unregisterSheet('core', ItemSheet)
    Items.registerSheet('itbadlands', itbadlandsItemSheet, { makeDefault: true })

    // If you need to add Handlebars helpers, here are a few useful examples:
    Handlebars.registerHelper('concat', function() {
        let outStr = ''

        for (const arg in arguments) {
            if (typeof arguments[arg] !== 'object') {
                outStr += arguments[arg]
            }
        }

        return outStr
    })

    Handlebars.registerHelper('toLowerCase', function(str) {
        return str.toLowerCase()
    })

    Handlebars.registerHelper('boldIf', function(cond, options) {
        return (cond) ? '<b>' + options.fn(this) + '</b>' : options.fn(this)
    })
})