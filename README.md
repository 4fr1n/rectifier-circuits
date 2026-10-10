# Controlled & Uncontrolled Rectifier Simulation Lab

An interactive Power Electronics & Solid State Devices Virtual Laboratory simulating **Uncontrolled Diode Rectifiers** and **Controlled Thyristor (SCR) Converters**.

Live interactive dual-trace oscilloscope, dynamic transfer characteristics ($V_{dc}$ vs $\alpha$), and animated circuit schematics.

---

## ⚡ Features

- **Controlled Thyristor Rectifiers**:
  - Single-Phase Half-Wave Controlled Rectifier
  - Single-Phase Semi-Converter (Half-Controlled Bridge)
  - Single-Phase Full-Converter (Fully-Controlled Bridge with continuous inversion capability for $\alpha > 90^\circ$)
- **Uncontrolled Diode Rectifiers**:
  - Half-Wave Diode Rectifier
  - Center-Tapped Full-Wave Rectifier
  - Full-Wave Bridge Diode Rectifier with Capacitive Filter ($C$)
- **Dynamic Parameter Knobs**:
  - **Firing Angle ($\alpha$)**: Continuous slider from $0^\circ$ to $180^\circ$ with quick presets ($0^\circ, 30^\circ, 45^\circ, 60^\circ, 90^\circ, 120^\circ, 150^\circ$)
  - **Load Resistance ($R_L$)**: Continuous slider from $10\,\Omega$ to $2000\,\Omega$
  - **Load Nature**: Resistive ($R$-Load) or Inductive ($R\text{-}L$ Load with variable inductance and Freewheeling Diode option)
  - AC Supply Amplitude ($V_m$) and Frequency ($f$)
- **Real-Time Visualizations**:
  - **Dual/Multi-Trace Digital Storage Oscilloscope**: Plots $v_o(t)$, $v_{in}(t)$, $i_o(t)$, $v_T(t)$, and gate trigger pulses $i_g(t)$ with freeze control and measurement cursors
  - **Transfer Characteristic Plot**: Real-time operating point tracking along the theoretical cosine curve $V_{dc}(\alpha)$
  - **Dynamic Circuit Schematics**: Vector graphics showing SCR gate trigger terminals, active switch states, and animated current flow
- **Multimeter & Logging**:
  - True RMS readouts for $V_{dc}$, $V_{rms}$, Ripple Factor ($\gamma$), Load Current ($I_{dc}$), Output Power ($P_{dc}$), and Conduction Angle ($\gamma^\circ$)
  - One-click observation logger and CSV export

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/<YOUR-USERNAME>/Rectifier-lab.git
cd Rectifier-lab

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🌐 Deploy to GitHub Pages

This repository includes an automated GitHub Actions deployment workflow in `.github/workflows/deploy.yml`.

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/Rectifier-lab.git
   git push -u origin main
   ```
2. In your repository on GitHub, go to **Settings > Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Your site will automatically build and publish at `https://<YOUR-USERNAME>.github.io/Rectifier-lab/`.
