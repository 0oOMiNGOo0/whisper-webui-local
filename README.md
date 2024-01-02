# Whisper WebUI (local version)

[Robust Speech Recognition via Large-Scale Weak Supervision, PMLR 2023](https://arxiv.org/abs/2212.04356), by Alec Radford, Jong Wook Kim, Tao Xu, Greg Brockman, Christine Mcleavey, Ilya Sutskever  
[Original Github](https://github.com/openai/whisper)

## Dependencies

- Python=3.9

## How to Start

### 1. Install nvm and nodejs and run

```bash
cd whisper-webui-local/frontend
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install 18.17.0
npm install
npm run build
npm run dev
```

### 2. Install python packages and run

```bash
cd ../backend
pip install -r requirements.txt
sudo apt update
sudo apt install ffmpeg # install ffmpeg
python whisper_import.py
```

Now you can access to localhost
