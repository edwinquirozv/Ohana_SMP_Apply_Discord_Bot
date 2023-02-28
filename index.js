const {
    Client,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputStyle,
    TextInputBuilder
} = require('discord.js');
const client = new Client({ intents: ['Guilds', 'MessageContent', 'GuildMessages'] });
const config = require('./config.json');
require('dotenv').config();

client.on('ready', () => {
    console.log(`${client.user.tag} esta listo para verle el qlo a chilillo`);
})

client.on('messageCreate', (message) => {
    if (message.content === '!enviar') {
        if (!config.admins.includes(message.author.id)) return;
        const embed = new EmbedBuilder()
        .setTitle('Apply Miembro | OhanaSMP')
        .setDescription('Presiona el boton para enviar tu apply a los administradores')
        .setColor("DarkButNotBlack")
        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel('Apply')
            .setCustomId('apply')
            .setEmoji('🔰')
        )
        const channel = message.guild.channels.cache.get(config.applyChannel);
        if (!channel) return;
        channel.send({
            embeds: [embed],
            components: [row]
        })
    }
})

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        // show modal
        if (interaction.customId === 'apply') {
            const modal = new ModalBuilder()
            .setTitle('Apply Miembro | OhanaSMP')
            .setCustomId('miembro_apply')
    
            const nombre = new TextInputBuilder()
            .setCustomId('nombre')
            .setLabel("Nombre en minecraft y discord")
            .setMinLength(2)
            .setMaxLength(100)
            .setRequired(true)
            .setPlaceholder('Ej. MC: EdwinQuiVe11/DSC: VenQui#7182')
            .setStyle(TextInputStyle.Short)
    
            const edad = new TextInputBuilder()
            .setCustomId('edad')
            .setLabel("Edad")
            .setMinLength(1)
            .setMaxLength(3)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Edad minima requerida 16 años')
            .setRequired(true)
    
            const aporte = new TextInputBuilder()
            .setCustomId('aporte')
            .setLabel("Que aportarias al servidor")
            .setMinLength(10)
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder(`Escribe aqui tu respuesta`)
            .setRequired(true)

            const estadisticas = new TextInputBuilder()
            .setCustomId('estadisticas')
            .setLabel("Captura de tus estadisticas (xbox no logros)")
            .setMinLength(10)
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Link de tus imagenes")
            .setRequired(true)

            const construcciones = new TextInputBuilder()
            .setCustomId('construcciones')
            .setLabel("Captura de tus construcciones (minimo 5)")
            .setMinLength(10)
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Link de tus imagenes")
            .setRequired(true)
    
            const rows = [nombre, edad, aporte, estadisticas, construcciones].map(
                (component) => new ActionRowBuilder().addComponents(component)
            )
    
            modal.addComponents(...rows);
            interaction.showModal(modal);
            // end of modal
        }

        // Accept and deny buttons
        if (interaction.customId === 'apply_accept') {
            // TODO: save user id in json or sum instead of getting id from embed footer
            const getIdFromFooter = interaction.message.embeds[0].footer.text;
            const getMember = await interaction.guild.members.fetch(getIdFromFooter);
            await getMember.roles.add(config.miembroRol).catch((err) => {
                console.error(err)
                return interaction.reply({
                    content: ":x: Hubo un error al intentar agregar el rol a el usuario."
                })
            });
            interaction.reply({
                content: `✅ El usuario **${getMember.user.tag}** fue aceptad@ y se le ha añadido su rol, aceptad@ por ${interaction.user.tag}`
            })
            await getMember.send({
                content: `**${getMember.user.tag}**, tu apply para miembro en OhanaSMP fue aceptada. 🎉 **felicidades** 🎉`
            }).catch(() => {
                return interaction.message.reply(':x: Hubo un error al intentar enviar un mensaje privado al usuario.')
            })
            const newDisabledRow = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder()
                .setCustomId('apply_accept_ended')
                .setDisabled()
                .setStyle(ButtonStyle.Success)
                .setLabel('Accept')
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId('apply_deny_ended')
                .setDisabled()
                .setStyle(ButtonStyle.Danger)
                .setLabel('Deny')
            )
            interaction.message.edit({ components: [newDisabledRow] })
        }
        if (interaction.customId === 'apply_deny') {
            // TODO: save user id in json or sum instead of getting id from embed footer
            const getIdFromFooter = interaction.message.embeds[0].footer?.text;
            const getMember = await interaction.guild.members.fetch(getIdFromFooter);
            await getMember.send({
                content: `**${getMember.user.tag}**, tu apply para miembro en OhanaSMP fue rechazada.`
            }).catch(e => {})
            interaction.reply({
                content: `:x: El usuario **${getMember.user.tag}** fue rechazad@, rechazad@ por ${interaction.user.tag}`
            })
            const newDisabledRow = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder()
                .setCustomId('staff_accept_ended')
                .setDisabled()
                .setStyle(ButtonStyle.Success)
                .setLabel('Aceptar')
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId('staff_deny_ended')
                .setDisabled()
                .setStyle(ButtonStyle.Danger)
                .setLabel('Rechazar')
            )
            interaction.message.edit({ components: [newDisabledRow] })
        }
    }
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'miembro_apply') {
            const nombre = interaction.fields.getTextInputValue('nombre');
            const edad = interaction.fields.getTextInputValue('edad');
            const aporte = interaction.fields.getTextInputValue('aporte');
            const estadisticas = interaction.fields.getTextInputValue('estadisticas');
            const construcciones = interaction.fields.getTextInputValue('construcciones');  
            if (isNaN(edad)) {
                return interaction.reply({
                    content: ":x: Su edad debe ser un número, por favor reenvíe el formulario.",
                    ephemeral: true
                })
            }
            interaction.reply({
                content: '✅ Su apply ha sido enviada con éxito.',
                ephemeral: true
            })
            const staffSubmitChannel = interaction.guild.channels.cache.get(config.adminsChannel);
            if (!staffSubmitChannel) return;
            const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setColor('Blue')
            .setTimestamp()
            .setFooter({ text: interaction.user.id })
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                {
                    name: "Nombre:",
                    value: nombre
                },
                {
                    name: "Edad:",
                    value: edad
                },
                {
                    name: "Que aportarias al servidor?",
                    value: aporte
                },
                {
                    name: "Captura de tus estadisticas (xbox no logros)",
                    value: estadisticas
                },
                {
                    name: "Captura de tus construcciones (minimo 5)",
                    value: construcciones
                }
            )
            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('apply_accept')
                .setLabel('Aceptar')
                .setStyle(ButtonStyle.Success)
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId('apply_deny')
                .setLabel('Rechazar')
                .setStyle(ButtonStyle.Danger)
            )
            staffSubmitChannel.send({
                embeds: [embed],
                components: [row]
            })
        }
    }
})

client.login(process.env.TOKEN);