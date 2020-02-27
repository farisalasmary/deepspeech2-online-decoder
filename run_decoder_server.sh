python decoder_server.py --host 0.0.0.0 \
                         --port 8888 \
                         --lm-path /volume/3-gram.pruned.3e-7.arpa \
                         --decoder beam --alpha 1.97 --beta 4.36 \
                         --model-path /volume/librispeech_pretrained_v2.pth \
                         --beam-width 1024 \ 
                         --cuda
