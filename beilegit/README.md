# BeiLegit

Know the real price before you pay.

BeiLegit is a public record of fixed prices in Kenya. Organisations and official bodies publish what they charge, and citizens check those prices so they are not overcharged or scammed.

Built with plain HTML, CSS and JavaScript. No PHP, no build step, no server. Runs on GitHub Pages.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Home: search every sector, browse by sector |
| `health.html` | Medicines and healthcare (medicines, hospital services, tests and scans, SHA) |
| `government.html` | Government service fees |
| `mobile-money.html` | M-PESA, Airtel Money, call and SMS rates |
| `transport.html` | Train fares and tolls |
| `energy.html` | Fuel caps and electricity rates |
| `more.html` | Parks, schools, salons, repairs and other businesses |
| `organisations.html` | Organisations add their prices and send them for approval |
| `contact.html` | Contact details and how to report an overcharge |
| `admin.html` | Password-protected admin area |

## Other files

| File | Purpose |
|---|---|
| `config.js` | CEO name, contact details and the admin password hash |
| `data.js` | The published listings every visitor sees |
| `app.js` | Shared code: header, footer, price board, forms |
| `admin.js` | Admin area |
| `style.css` | All styling, light and dark |

`script.js` from the first version is no longer used. Delete it from the repository.

## Set your contact details

Open `config.js` and fill in `email`, `phone` and `whatsapp`. They appear in the footer of every page and on the contact page. Empty values are not shown.

## How a listing goes public

1. An organisation fills in the form on `organisations.html` and taps **Send for approval**. That gives them an approval code (it starts with `BEILEGIT1:`), which they send to you by WhatsApp or email.
2. You sign in at `admin.html`, open **Import submission**, and paste the code. It lands in **Pending**.
3. You check the organisation, then **Approve**, **Edit** or **Reject**.
4. Open **Publish**, download `data.js`, and upload it to the GitHub repository in place of the old one. The public site updates in a few minutes.

You can also edit, verify or delete any existing listing under **Listings**, then publish the same way.

## Admin security

- The admin page asks for the password every time it opens and signs out after 10 minutes without activity.
- Change the first password straight away: sign in, open **Password**, create the new line and paste it into `config.js`.
- This is a static site, so the password only guards the admin screen. The public site changes only when `data.js` is committed to this repository. Your GitHub account is the real lock: use a strong password and two-factor authentication, and do not add collaborators you do not trust.

## Put it online with GitHub Pages

1. Upload every file to the repository.
2. Go to **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.
3. The site goes live at `https://<your-username>.github.io/<repository-name>/`.

## Keeping prices current

Each official listing has a `source` link. Re-check them regularly. EPRA reviews fuel prices on the 14th of every month.
