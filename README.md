#Tiny App

### Description
A three-day web app project using Node. The app allows users to shorten long URLs much like TinyURL.com, bit.ly, and the like.
Built with an HTTP Server to handle requests from the browser (client) along with Express

### Functional Requirements
1. As an avid twitter poster, I want to be able to shorten links so that I can fit more non-link text in my tweets.
  - When I visit `http://localhost:3000/`, I see a form which contains a field to submit a URL and a button
  - When I fill in the form with a URL and submit it, I see a page with the original URL, a short URL and link to go back to the submission form

2. As an avid twitter poster, I want to be able to see how many times my subscribers visit my links, so that I can learn what content they like.
  - When I visit `http://localhost:3000/`, I see a login form
  - When I submit the login form Then I am logged in
  - Given I submitted links when I was logged in When I visit `/urls` Then I see my links and the number of visits each had

3. As a twitter reader, I want to be able to visit sites via shortened links, so that I can read interesting content.
  - When I visit a short link I am redirected to the page corresponding to the short URL's original URL
  
### Stack Requirement
- ES6
- Node
- Express
- Git for version control
- Cookie-session for session storage
- Bcrypt for password encryption
