
# avghmn.com
Static blog built with [Eleventy](https://www.11ty.io/), [bulma](https://bulma.io) and [Netlify CMS](https://www.netlifycms.org/)

Initially based on [fernfolio-11ty-template](https://github.com/TylerMRoderick/fernfolio-11ty-template) with a
customized theme.


## Setup local environment
- Clone the repo locally `git clone https://github.com/TylerMRoderick/fernfolio-11ty-template.git`
- Navigate to root folder `cd your-site`
- Install the goods `npm install`
- Run it `npm start`
- You should now be able to see everything running on localhost:8080
- Push your changes to github and an auto-deploy should be triggered

## 💻 Development Scripts

**`npm start`**

> Run 11ty with hot reload at localhost:8080

**`npm run build`**

> Generate minified production build

Use this as the "Publish command" if needed by hosting such as Netlify.

Checkout the Eleventy [Command Line Usage docs](https://www.11ty.dev/docs/usage/) for more options


## 🎩 Common issues

If you change the repo that was created at deploy time from public to private, you'll need to regenerate your token,
as the token generated using the deploy to Netlify button can only access public repositories. To
regenerate your token, head to "Settings" in your Netlify site dashboard, go to the "Identity"
section, then scroll to "Services" where you'll see an "Edit settings" button. Click that and you'll
see a text link to "Generate access token in GitHub".

If you need any help with setting up Netlify CMS, you can reach out to the Netlify team in the [Netlify CMS Gitter](https://gitter.im/netlify/netlifycms).
