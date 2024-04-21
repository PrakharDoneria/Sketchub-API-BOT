const { Telegraf } = require('telegraf');
const axios = require('axios');
const FormData = require('form-data');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Jinda hu');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const bot = new Telegraf(process.env.TGtoken);

bot.start((ctx) => ctx.reply('Welcome! Use /categories to view categories.'));

bot.command('categories', async (ctx) => {
    try {
       const apiKey = '28356352-e2da-4834-990a-25fcbe065433';

        const form = new FormData();
        form.append('api_key', apiKey);

        const response = await axios.post('https://sketchub.in/api/v3/get_categories', form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        console.log(response.data); // Log the entire API response

        if (response.data.status === 'success') {
            const categories = response.data.categories;

            const replyMessage = categories.map((category) => {
                const categoryName = category.category_name.toLowerCase();
                const categoryLink = `<a href="${categoryName}">${categoryName}</a>`;
                const totalProjects = category.total_projects;

                return `${categoryLink}: Total Projects ${totalProjects}`;
            }).join('\n');

            ctx.replyWithHTML(replyMessage);
        } else {
            ctx.reply(`API Response Status: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Error:', error.message);
        ctx.reply('An error occurred while processing the request.');
    }
});

bot.command('id', async (ctx) => {
    try {
        const apiKey = '28356352-e2da-4834-990a-25fcbe065433';
        const projectId = ctx.message.text.split(' ')[1];

        if (!projectId || isNaN(projectId)) {
            ctx.reply('Invalid project ID. Please provide a valid integer.');
            return;
        }

        const form = new FormData();
        form.append('api_key', apiKey);
        form.append('project_id', projectId);

        const response = await axios.post('https://sketchub.in/api/v3/get_project_details', form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        console.log(response.data);

        if (response.data.status === 'success') {
            const projectDetails = response.data;

            const replyMessage = `
Title: ${projectDetails.title}
Description: ${projectDetails.description}
Category: ${projectDetails.category}
Project Type: ${projectDetails.project_type}
Video URL: ${projectDetails.video_url}
Project Icon: ${projectDetails.project_icon}
Project Size: ${projectDetails.project_size}
Likes: ${projectDetails.likes}
Comments: ${projectDetails.comments}
Downloads: ${projectDetails.downloads}
User Name: ${projectDetails.user_name}
User Profile Pic: ${projectDetails.user_profile_pic}
User Badge: ${projectDetails.user_badge}
`;

            ctx.reply(replyMessage);
        } else {
            ctx.reply(`API Response Status: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Error:', error.message);
        ctx.reply('An error occurred while processing the request.');
    }
});

bot.command('projectList', async (ctx) => {
    try {
        const apiKey = '28356352-e2da-4834-990a-25fcbe065433';
        const pageNumber = ctx.message.text.split(' ')[1] || 1; // If number input is null, default to page 1

        const form = new FormData();
        form.append('api_key', apiKey);
        form.append('page_number', pageNumber);

        const response = await axios.post('https://sketchub.in/api/v3/get_project_list', form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        console.log(response.data); // Log the entire API response

        if (response.data.status === 'success') {
            const projects = response.data.projects;

            for (const project of projects) {
                const replyMessage = `
Title: ${project.title}
Description: ${project.description}
Category: ${project.category}
Project Type: ${project.project_type}
Likes: ${project.likes}
Comments: ${project.comments}
Downloads: ${project.downloads}
User Name: ${project.user_name}
User Profile Pic: ${project.user_profile_pic}
User Badge: ${project.user_badge}
`;
                await ctx.reply(replyMessage);
            }
        } else {
            await ctx.reply(`API Response Status: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Error:', error.message);
        await ctx.reply('An error occurred while processing the request.');
    }
});


bot.command('find', async (ctx) => {
    try {
        const apiKey = '28356352-e2da-4834-990a-25fcbe065433';
        const username = ctx.message.text.split(' ')[1];

        if (!username) {
            ctx.reply('Please provide a username.');
            return;
        }

        const form = new FormData();
        form.append('api_key', apiKey);
        form.append('find_relevant', username);
        form.append('user_name', username);

        const response = await axios.post('https://sketchub.in/api/v3/find_username.php', form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        console.log(response.data); // Log the entire API response

        if (response.data.status === 'success') {
            if ('uid' in response.data) {
                // Response for user_name
                const uid = response.data.uid;
                const replyMessage = `User ID: ${uid}, Username: ${username}`;
                await ctx.reply(replyMessage);
            } else if ('relevant_usernames' in response.data) {
                // Response for find_relevant
                const relevantUsernames = response.data.relevant_usernames || [];

                if (relevantUsernames.length === 0) {
                    ctx.reply(`No relevant usernames found for "${username}".`);
                    return;
                }

                const replyMessage = relevantUsernames.map((user) => {
                    return `ID: ${user.id}, Name: ${user.name}`;
                }).join('\n');

                await ctx.reply(replyMessage);
            } else {
                ctx.reply('Unexpected response format.');
            }
        } else {
            await ctx.reply(`API Response Status: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Error:', error.message);
        await ctx.reply('An error occurred while processing the request.');
    }
});

bot.command('detail', async (ctx) => {
    try {
        const apiKey = '28356352-e2da-4834-990a-25fcbe065433';
        const id = ctx.message.text.split(' ')[1];
        const username = ctx.message.text.split(' ')[2];

        if (!id || !username) {
            ctx.reply('Please provide both ID and username.');
            return;
        }

        const form = new FormData();
        form.append('api_key', apiKey);
        form.append('user_id', id);
        form.append('user_name', username);

        const response = await axios.post('https://sketchub.in/api/v3/get_user_profile', form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        console.log(response.data); // Log the entire API response

        if (response.data.status === 'success') {
            const userData = response.data;

            const replyMessage = `
User ID: ${userData.uid}
Username: ${userData.username}
Badge: ${userData.badge}
About: ${userData.about}
Country: ${userData.country}
Profile Pic: ${userData.profilepic}
Total Likes: ${userData.total_likes}
Total Downloads: ${userData.total_downloads}
Total Public Projects: ${userData.total_public_projects}
Total Verified Projects: ${userData.total_verified_projects}
Total Editor Choice Projects: ${userData.total_editor_choice_projects}
`;

            await ctx.reply(replyMessage);
        } else {
            await ctx.reply(`API Response Status: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Error:', error.message);
        await ctx.reply('An error occurred while processing the request.');
    }
});


bot.launch().then(() => {
    console.log('Bot started successfully');
}).catch((error) => {
    console.error('Error starting bot:', error.message);
});

process.on('unhandledRejection', (error) => {
  try {
    console.error('Unhandled Rejection:', error);
  } catch (handleError) {
    console.error('Error handling unhandled rejection:', handleError);
  }
});