
# DeepSpeech2 Online (Real-time) Decoder

This project works as an extension to this [DeepSpeech2 implementation](https://github.com/SeanNaren/deepspeech.pytorch). 

## Getting Started
### Prerequisites

Since this project is an extension for  [DeepSpeech2](https://github.com/SeanNaren/deepspeech.pytorch), you need to follow the installation  instructions mentioned there.

### Installing
Simply, copy the content of this folder and paste it inside `deepspeech.pytorch` folder.

## How To Run it?

I'll illustrate it on [this pretrained acoustic model](https://github.com/SeanNaren/deepspeech.pytorch/releases/download/v2.0/librispeech_pretrained_v2.pth) and [this ARPA language model](http://www.openslr.org/resources/11/3-gram.pruned.3e-7.arpa.gz). You can find other models as well [here](https://github.com/SeanNaren/deepspeech.pytorch/releases).

 You need to edit some files before you run the server application.
1. Open the `run_decoder_server.sh` file and change the following variables:
**--lm-path**: the path of the language model.
**--model-path**: the path of the acoustic model.
**--port**: the port that the server will be listening on.
```bash
python decoder_server.py --host 0.0.0.0 \
                         --port 8888 \
                         --lm-path /volume/3-gram.pruned.3e-7.arpa \
                         --decoder beam --alpha 1.97 --beta 4.36 \
                         --model-path /volume/librispeech_pretrained_v2.pth \
                         --beam-width 1024 \ 
                         --cuda

```

2. Open `js/app.js` and find the following variables and change them:
**ws_ip**: is the IP address of the computer that runs the`run_decoder_server.sh` script.
**ws_port**:is the port that you use in the`run_decoder_server.sh` script.
```javascript
var ws_ip = '0.0.0.0'
var ws_port = '8888'
```
3. Copy `data/extended_data_loader.py` from this project to the `data` folder in the `deepspeech.pytorch` folder.

Finally, run the following in different terminals:
```bash
> python website_server.py
```
```bash
> ./run_decoder_server.sh
```
## Authors

* **Faris Alasmary** - [farisalasmary](https://github.com/farisalasmary)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments
 Many thanks for those who made it possible for this project to be realized!
 This project uses the functionalities of different open-source projects that are mentioned below.
* [Deepspeech2 in Pytorch](https://github.com/SeanNaren/deepspeech.pytorch)
* [Recorder.js](https://github.com/mattdiamond/Recorderjs)
* [Simple Recorder.js demo](https://github.com/addpipe/simple-recorderjs-demo)
* [LZ-string Compressor in Javascript](https://github.com/pieroxy/lz-string/)
* [LZ-string Compressor in Python](https://github.com/eduardtomasek/lz-string-python) 
* [Websocket Server in Python](https://github.com/Pithikos/python-websocket-server)

