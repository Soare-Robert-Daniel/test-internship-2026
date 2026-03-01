# Themeisle Internship Test for 2026

## Introduction

This is the challenge for the Themeisle Internship Test for 2026. The goal of this test is to evaluate your skills in creating a software product.

Since we are a web company, the challenge will be in creating a web application; and main subject of it will be a simple prediction market. The application should allow users to create and participate in prediction markets on various topics. Users should be able to create markets, place bets, and view the outcomes of the markets.

### Deadline

The submission deadline for this test is 11:59 PM on March 21, 2026. Please make sure to submit your application before the deadline to be considered for the internship.

### I do not know web development, can I still do the test?

Yes. With the rise of AI tools, the entry barrier for web development is much lower than before. You can use AI tools to assist you in the development process.

### Why prediction markets?

With the popular rise of platforms like Polymarket and Kalshi, we thought it would be an interesting challenge compared to the usual ones like building a to-do list, weather app, or a blog.

We need to keep in mind that the current LLM models are very powerful, thus the challenge might be overwhelming at first glance. However, we encourage you to break down the problem into smaller, manageable tasks. The test is made around basic idea of web development, so there will be no need to implement complex algorithms. Focus on creating a functional and user-friendly application that meets the requirements.

### Usage of AI tools

We strongly encourage you to leverage AI tools to assist you in the development process. You can use AI tools for code generation, debugging, and even for brainstorming ideas. However, we expect you to be able to explain your solution and the choices you made during the development process.

At the end of the day, this test will represent your idea of a software product regardless of the tools you used to create it.

## Evaluation Criteria

Your submission will be evaluated based on the following criteria:
1. **Functionality**: Does the application meet the requirements? Can users create markets, place bets, and view outcomes?
2. **User Experience**: Is the application user-friendly and visually appealing? (Since this is a subjective criterion, we will not expect you to be a designer, but we will look for a clean and intuitive interface that respects best practices of UI/UX design and is not hostile to the user).
3. **Code Quality**: You may generate the code using AI tools, but code is a liability in itself, so ask yourself if you would be able to maintain it in the future.

### Submission Guidelines

(REQUIRED STEP) Once you finish your application, in the `./submission` folder, please include a video demo or images showcasing the functionality of your application, along with a brief write-up explaining your design choices and any challenges you faced during development.

Few observations:
 - If the video cannot be included in the submission because of size restriction on the Git platform, you can upload it to a video hosting platform (like Google Drive) and include the link in the write-up (make sure that video link is public so that we can access it).
 - Make sure that if you make last minute changes to the UI, you update the video or images in the submission folder to reflect those changes.
 
 Once everything is done, please submit the repository link on our platform at example.com/submit. We will review your submission and get back to you with feedback.

## Story

 A little story to set the mood for the challenge.

### Two founders

Hank and John are old friends who go way back to their college days. While Hank was always more interested in the business side of things, John was the tech-savvy one.

While doom-scrolling on X, Hank saw the rise of prediction markets and thought it would be a great business opportunity. He immediately called John and pitched the idea to him. John was intrigued by the idea and agreed to work on it with Hank.

While working on the project, the rise of LLM tools started to revolutionize the way software is developed. Hank was excited about those new tools that will make John work faster. But this view was not shared by John.

#### The end of programming?

John was very sad about the rise of LLM tools. He felt that his skills as a programmer were becoming obsolete. He was worried about his future and the future of programming in general. So he decided to quit programming and become a farmer.

After hearing the news, Hank was devastated. Ok, the AI can write code, but this does not mean that he can now be the one responsible for the product. Someone must take the responsibility of the product.

#### The product owner

In the search for a product owner, Hank came across your profile and thought that you would be a great fit for the role. He reached out to you and explained the situation.

Here are the things that John managed to do before quitting programming:
- He created a basic wireframe of the application.
- He set up the project structure and created a basic backend API.
- He implemented the basic functionality for creating markets and placing bets.
- He created a basic frontend interface for the application.

Now, Hank needs you to take over the project and finish it.

## Task

Hank has a list of ideas that he wants to implement in the application. Here are the main features that he wants to see in the final product:

1. Main dashboard where users can see all the active markets and their outcomes. All updated in real-time with filters like order by creation date, bet size, etc. (Since there can be many bets, make sure to implement pagination).
2. User profile page where users can see their betting history and current bets. Also updated in real-time for the current bets. (Since a user can have many bets, make sure to implement pagination).
3. The bet page with a graph showing the distribution of bets and the current odds for each outcome.
4. Leaderboard showing the top users based on their winnings.

### Optional features

Hank also thinks that the users will want to use bots to place bets, so the app will need to have an API that allows users to place bets programmatically. So users should be able to generate an API key from their profile page and use it to place bets using the API. So the backend will need to have endpoints similar to the ones in the frontend that allow users to:
- Create markets
- Place bets
- View outcomes
- List markets

Hint: Think if you can reuse the same endpoints for both the frontend and the API, this will make your life easier and will also make the application more consistent.

## Other information

- This test will use Bun as the runtime environment for the backend, and sqlite as the database. There is no need for other types of databases or runtime environments. If your application is too slow in your tests, think how you can optimize before doing radical things like adding a new service (e.g. redis) or changing the database.
- You can design the database table structure as you see fit, in case you change the existing one, make sure to add the migration file for it.
- If you do not like the current wireframe or UI library, feel free to change it. Just make sure to update the video or images in the submission folder to reflect those changes.
- You can use any libraries or frameworks that you think will help you in the development process. However, we encourage you to keep the application as simple as possible and avoid adding unnecessary dependencies since the test is not that complex in its nature.
- We recommend the usage of AI tools that have agent capabilities, so that you can delegate some of the tasks to the AI and focus on the overall architecture and design of the application. However, make sure to review the code generated by the AI since you may find some bugs or issues that the AI might have missed.

### How to start

1. Make sure that project is running locally on your machine. The Bun runtime is cross-platform, so you should be able to run it on any operating system. If you encounter any issues, you can also switch the runtime to Node.js, but make sure to remove the Bun-specific code and dependencies.
2. Try to analyze similar products like Polymarket and Kalshi to get a better understanding of the features and functionalities that you need to implement. Since this is a simple project, do not overcomplicate things by adding features that are not necessary.
3. Think first as an user. You may write great code, or use the fanciest libraries, but the people who will use it will not care. They just want to bet and your bugs or UX idea should not get in the way of that.

Documentation references:
- https://bun.sh/docs
- https://tanstack.com/router/latest
- https://tanstack.com/query/latest
- https://tanstack.com/table/latest
- https://tanstack.com/form/latest
- https://ui.shadcn.com/docs
- https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

### Install dependencies

```bash
bun install
```

### Run the application

```bash
bun run dev
```