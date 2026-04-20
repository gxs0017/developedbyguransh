# Dev Log — Session 1
**Date:** April 19, 2026
**Developer:** Guransh (gxs0017)
**Site:** developedbyguransh.dev

---

## Who This Log Is For

This log is written so that any Claude instance, or Guransh himself coming back after time away, can read it top to bottom and fully understand what was built, what decisions were made, why they were made, and where things stand. Nothing is assumed. Everything is explained.

---

## Who Guransh Is

Guransh is a student developer based in Brampton, Ontario, Canada. He is learning web development with a focus on 3D and dynamic UI. He has a Lenovo Legion 7i Pro laptop with an RTX 5090 (24GB GDDR7 VRAM, laptop variant — not the desktop 32GB version), 64GB of RAM, and 3-4TB of free storage. He runs LM Studio locally with a Qwen3.5 27B model (Claude Opus distilled) for heavy AI usage, and uses Free Claude (now upgraded to Pro as of this session) for architectural decisions and learning. He recently purchased a domain and wants to build a real portfolio.

---

## The Infrastructure — What Was Built and Why

### The Domain

Guransh purchased `developedbyguransh.dev` from Porkbun for approximately $8 CAD. Porkbun is just a domain registrar — they sell domain names the way a store sells phone numbers. Owning a domain means you have the right to use that web address, but it doesn't automatically mean anything is hosted there.

### Cloudflare

The domain was connected to Cloudflare. Cloudflare sits between the internet and your server and provides several things for free — SSL certificates (the padlock in the browser, meaning HTTPS), DDoS protection, bot filtering, and most importantly for this setup, something called **Cloudflare Tunnel**.

Cloudflare Tunnel is the architectural centerpiece of this whole setup and it's worth understanding deeply. Normally, to host a website from home you'd need to open ports on your router and expose your home IP address to the internet. That's dangerous — your home IP becomes publicly known and anyone can probe it for vulnerabilities. Cloudflare Tunnel flips this completely. Instead of the internet connecting *into* your home, your server reaches *out* to Cloudflare and maintains a permanent connection. All visitor traffic flows through Cloudflare and down that outbound tunnel. Your home IP is never exposed. Nobody on the internet can directly reach your server at all — they can only reach Cloudflare, which forwards traffic through the tunnel. This is genuinely smart architecture that many hobbyists get wrong.

### The N100 Mini PC

Guransh has an N100 mini PC acting as his web server. The N100 is a low-power Intel processor — cheap to run 24/7, which is exactly what a home server needs. It runs Ubuntu Server with a GUI installed. Ubuntu is a Linux distribution and the industry standard for servers.

For remote access to this machine, Guransh uses two tools together. **Tailscale** creates a private encrypted network between his devices — it's built on a technology called WireGuard and essentially makes his laptop and his mini PC behave as if they're on the same local network even when they're far apart. **NoMachine** is a remote desktop tool that lets him see and control the Ubuntu desktop visually. The previous setup used xrdp (Windows-style remote desktop) on port 3389, but this was replaced with NoMachine because xrdp has a poor security history. Port 3389 was closed in UFW (Ubuntu's firewall) as part of this cleanup.

### Why This Architecture Is Safe

To summarize the security model clearly: visitors hit Cloudflare, Cloudflare forwards through the tunnel, the tunnel connects to Nginx on the server. No ports are open to the public internet — UFW (the firewall) blocks everything inbound. Guransh accesses the server privately through Tailscale, which is a closed network requiring authentication to join. The result is a server that is effectively invisible to the public internet while still serving a public website. This is the correct way to self-host.

### The 525 Visitors Mystery

Cloudflare analytics showed 525 unique visitors and 9,000 total requests even though nothing was hosted on the site yet. This is completely normal and not an attack. The moment a domain gets an SSL certificate issued, it appears in something called Certificate Transparency Logs — public records that bots monitor 24/7 specifically to find new domains to scan. Tools like Shodan probe every IP on the internet continuously. The real human visitor count was essentially zero. Cloudflare's bot blocking was already filtering the bulk of this traffic, which is why 9,000 requests only translated to 40MB of data served.

---

## Local Model Stack

Before starting to build, Guransh asked about the best local LLM models to complement his workflow. After research, the recommended three-model stack for his RTX 5090 (24GB VRAM) is as follows.

For pure coding tasks — writing components, fixing bugs, generating boilerplate — the community consensus pick is **Qwen3-Coder-30B at Q5_K_M quantization**. It fits comfortably in 24GB VRAM and benchmarks show it leads specifically on coding tasks among models in this size class. The current model Guransh runs (Qwen3.5 27B Claude-distilled) is better suited as a general reasoning model, which is the second slot. For hard architectural problems that require deep reasoning — the kind of question where you need to think through many steps — **DeepSeek R1 32B at Q4_K_M** rounds out the stack. Free Claude and Gemini Pro handle what local models genuinely can't: nuanced explanations, learning new concepts, and the large context tasks Gemini handles well.

---

## The Tech Stack Decision

The portfolio will be built with **Vite + React + TypeScript + Framer Motion**. Each choice has a reason. Vite is the build tool — it starts a development server instantly and builds the final production files very fast. React is the UI framework — it lets you build interfaces as reusable components rather than writing raw HTML for every page. TypeScript adds types to JavaScript, which means the editor catches mistakes before you run the code, which is invaluable when learning. Framer Motion is the animation library — it makes smooth, professional animations significantly easier than raw CSS. The original plan mentioned a three-month learning path through React Three Fiber for 3D, but Guransh decided to focus on Framer Motion first and build something real rather than follow a rigid schedule. This is the right call.

---

## What Was Actually Built Today

### Phase 1 — GitHub Repository

A GitHub repository was created at `https://github.com/gxs0017/developedbyguransh`. GitHub serves as the central home for the code — it's accessible from any machine, it stores the full history of every change ever made, and it becomes the trigger point for automatic deployment.

### Phase 2 — Local Project Initialization

On Guransh's Windows machine, the Vite project was created with this command:

```bash
npm create vite@latest developedbyguransh -- --template react-ts
```

This command uses npm's `create` feature to run Vite's project wizard, scaffolding a complete React TypeScript project into a new folder. Dependencies were installed with `npm install`, and then Framer Motion and Lucide React (an icon library) were added with `npm install framer-motion lucide-react`.

A line ending issue came up during git initialization — Windows uses CRLF line endings while Linux uses LF. Since the code runs on a Linux server, keeping everything as LF is cleaner. The fix was one git config command:

```bash
git config --global core.autocrlf input
```

This tells Git to never convert to Windows-style line endings. The important thing to understand is that this doesn't break anything on Windows — Vite, Node.js, and VS Code all handle LF files perfectly on Windows. Only very old tools care about this distinction.

The project was then connected to GitHub and pushed up. The git workflow introduced here — `git add .`, `git commit -m "message"`, `git push` — is the fundamental three-command loop that Guransh will use every single day going forward. `git add` stages changes (puts them in the box), `git commit` takes the snapshot (seals the box), `git push` sends it to GitHub (ships the box).

### Phase 3 — Server Setup

On the N100 Ubuntu server, Node.js 20 was installed using NodeSource's official installer script, then npm was used to install PM2 (a process manager). The repository was cloned from GitHub directly onto the server.

A permissions error appeared — `EACCES: permission denied`. This is one of the most common Linux errors beginners encounter. The cause was that `/var/www` was created with `sudo`, making it owned by the root user. Guransh's user account (`jxmmy17`) didn't have permission to write inside it. The fix was `chown` — change owner:

```bash
sudo chown -R $USER:$USER /var/www/developedbyguransh
```

This transferred ownership of the folder and everything inside it to the current user. After this, `npm install` and `npm run build` ran successfully. The build command is a critical concept — it takes the TypeScript source files in `src/` and converts them into compressed, browser-ready HTML, CSS, and JavaScript in a `dist/` folder. This `dist/` folder is what gets served to real visitors, not the source files.

### Phase 4 — Nginx Web Server

Nginx was installed on the server. Nginx is a web server — its job is simple: when a request comes in, find the right file and send it back. It was configured to listen on port 8080 and serve files from `/var/www/developedbyguransh/dist`. The configuration also includes `try_files $uri $uri/ /index.html` which is essential for React apps — it means any URL that doesn't match a file falls back to `index.html`, letting React handle routing on the client side.

The Cloudflare Tunnel was then updated from `http://localhost:3000` (which was a leftover dev server setting pointing at nothing) to `http://localhost:8080` (where Nginx is now listening).

After this change, `developedbyguransh.dev` loaded the default Vite + React page in the browser. **The site is live.**

### Phase 5 — Auto-Deploy Attempt

A `deploy.sh` script was created on the server. This script is simple — it pulls the latest code from GitHub, runs `npm install` to catch any new dependencies, and runs `npm run build` to rebuild the site. The idea is that this script gets triggered automatically whenever new code is pushed to GitHub.

The chosen trigger mechanism was GitHub Actions — a YAML file in the repository that GitHub reads and executes on every push. The first attempt failed due to a YAML formatting error (`No event triggers defined in 'on'`) caused by incorrect indentation. YAML is whitespace-sensitive — indentation is part of the syntax, not just style. Once fixed, the workflow ran but failed at the SSH connection step with `i/o timeout`.

This revealed an important architectural reality: GitHub Actions runs on GitHub's cloud servers, which are on the public internet. Tailscale is a private network. GitHub's servers cannot join Tailscale, so they cannot reach the N100 via its Tailscale IP. The solution identified — but not yet implemented — is to use the **official Tailscale GitHub Action**, which temporarily adds GitHub's runner machine to the Tailscale network before attempting SSH. This would make the connection possible.

---

## Current State of the Project

The site is live at `developedbyguransh.dev` and showing the default Vite + React template. The infrastructure is fully working. The only remaining setup task is completing the auto-deploy pipeline.

---

## What To Do Next Session

The first thing to do is finish the auto-deploy. Go to `tailscale.com` → Settings → Keys → Generate auth key. Make sure to check Reusable and Ephemeral. Add this key to GitHub Secrets as `TAILSCALE_AUTHKEY`. Then update `.github/workflows/deploy.yml` to add the Tailscale connection step before the SSH step, using `tailscale/github-action@v2`. Once that push goes green in the Actions tab, the entire pipeline is complete — push code, site updates automatically within 30 seconds.

After that, the real work begins. Start replacing the default Vite template with the actual portfolio design using Framer Motion for animations. The approach will be learning-first — understanding what every line of code does before moving to the next piece.

---

## Key Concepts Learned Today

**Linux ownership and permissions** — every file has an owner, `sudo` creates things owned by root, `chown` transfers ownership. `EACCES` errors almost always mean a permissions mismatch.

**Line endings** — Windows uses CRLF, Linux uses LF. For cross-platform development targeting a Linux server, always use LF. One git config command fixes this permanently.

**Dev vs production** — `npm run dev` starts a development server meant only for the developer. `npm run build` creates optimized production files. Never serve a dev server to real visitors.

**Git fundamentals** — `add` stages, `commit` snapshots, `push` sends. These three commands are the daily loop forever.

**Cloudflare Tunnel security model** — outbound tunnel means no open ports, no exposed home IP, server is invisible to the public internet while still serving a public website.

**SSH key pairs** — a private key and public key are generated together. The public key goes on any server you want access to. The private key stays secret on your machine. Authentication happens mathematically without passwords.

**YAML sensitivity** — GitHub Actions workflows are written in YAML which treats indentation as syntax. Tabs are not allowed, only spaces. Two spaces per level is the convention.

---

*End of Session 1. Next session: complete Tailscale GitHub Action auto-deploy, then begin building the actual portfolio UI with Framer Motion.*