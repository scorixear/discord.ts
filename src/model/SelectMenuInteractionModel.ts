import { SelectMenuInteraction } from 'discord.js';
import { StringSelectMenuInteractionModel } from './SelectMenuInteractionModels/StringSelectMenuInteractionModel';
import { Logger, WARNINGLEVEL } from '../helpers/logging';
/**
 * Represents on SelectMenuInteraction
 * {@link id} the custom-id for this interaction (actual custom-id can be longer, only start is checked)
 * @deprecated Replaced by {@link StringSelectMenuInteractionModel}
 */
export abstract class SelectMenuInteractionModel extends StringSelectMenuInteractionModel {
  /**
   * Default constructor
   * @param id the custom-id for this interaction (actual custom-id can be longer, check is done wiht startsWith())
   * @param deferReply The amount of milliseconds to defer the reply if no reply was already made. If undefined, does not defer reply
   * @param deferReplyEphemeral If true, will defer reply as ephemeral, making the reply ephemeral aswell
   */
  constructor(id: string, deferReply = 2000, deferReplyEphemeral = true) {
    super(id, deferReply, deferReplyEphemeral);
  }

  /**
   * Called when @see SelectMenuInteraction was received
   * @param interaction the interaction received
   */
  public async handle(interaction: SelectMenuInteraction) {
    if (this.deferReply) {
      setTimeout(async () => {
        try {
          if (!interaction.replied && !interaction.deferred) {
            await interaction.deferReply({ ephemeral: this.deferReplyEphemeral });
          }
        } catch (err) {
          Logger.exception('Error deferring reply', err, WARNINGLEVEL.ERROR);
        }
      }, this.deferReply);
    }
  }
}
