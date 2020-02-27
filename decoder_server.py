
import os

import torch
import logging
from data.extended_data_loader import OnlineSpectrogramParser
from decoder import GreedyDecoder
from opts import add_decoder_args, add_inference_args
from transcribe import transcribe
from utils import load_model

import time
import numpy as np
from websocket_server import WebsocketServer

from lzstring import LZString

##########################################################################################
# Called for every client connecting (after handshake)
def new_client(client, server):
    print("New client connected and was given id %d" % client['id'])
    server.send_message_to_all("Hey all, a new client has joined us")

##########################################################################################
# Called for every client disconnecting
def client_left(client, server):
    print("Client(%d) disconnected" % client['id'])

##########################################################################################
# Called when a client sends a message
def message_received(client, server, message):
    print('Transcribing the chunck....')
    start_time = time.time()
    
    message = decompressor.decompressFromUTF16(message)
    transcription, _ = transcribe(audio_path=message,
                                          spect_parser=spect_parser,
                                          model=model,
                                          decoder=decoder,
                                          device=device,
                                          use_half=args.half)
    end_time = time.time()
    print('Transcription was done in {}!!!...'.format(end_time - start_time))
    print("Client(%d) said: %s" % (client['id'], transcription))
    server.send_message(client, "You said: {}".format(transcription))

##########################################################################################
##########################################################################################
##########################################################################################
  

def main():
    import argparse
    global model, spect_parser, decoder, args, device, decompressor
    
    parser = argparse.ArgumentParser(description='DeepSpeech transcription server')
    parser.add_argument('--host', type=str, default='0.0.0.0', help='Host to be used by the server')
    parser.add_argument('--port', type=int, default=8888, help='Port to be used by the server')
    parser = add_inference_args(parser)
    parser = add_decoder_args(parser)
    args = parser.parse_args()
    logging.getLogger().setLevel(logging.DEBUG)

    logging.info('Setting up server...')
    torch.set_grad_enabled(False)
    device = torch.device("cuda" if args.cuda else "cpu")
    model = load_model(device, args.model_path, args.half)

    if args.decoder == "beam":
        from decoder import BeamCTCDecoder

        decoder = BeamCTCDecoder(model.labels, lm_path=args.lm_path, alpha=args.alpha, beta=args.beta,
                                 cutoff_top_n=args.cutoff_top_n, cutoff_prob=args.cutoff_prob,
                                 beam_width=args.beam_width, num_processes=args.lm_workers)
    else:
        decoder = GreedyDecoder(model.labels, blank_index=model.labels.index('_'))

    spect_parser = OnlineSpectrogramParser(model.audio_conf, normalize=True)
    logging.info('Server initialised')
    
    decompressor = LZString()
    
    server = WebsocketServer(host=args.host, port=args.port)
    server.set_fn_new_client(new_client)
    server.set_fn_client_left(client_left)
    server.set_fn_message_received(message_received)
    server.run_forever()


if __name__ == "__main__":
    main()
