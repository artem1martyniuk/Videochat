import torch.nn as nn


class RecurrentMaskNet(nn.Module):
    def __init__(self, input_size=257, hidden_size=128, num_layers=4):
        super(RecurrentMaskNet, self).__init__()

        self.pre_rnn_conv = nn.Sequential(
            nn.Conv1d(input_size, input_size, kernel_size=3, padding=1),
            nn.BatchNorm1d(input_size),
            nn.ReLU()
        )

        self.gru = nn.GRU(input_size, hidden_size, num_layers=num_layers,
                          batch_first=True, bidirectional=True, dropout=0.5)

        self.decoder = nn.Sequential(
            nn.Linear(hidden_size * 2, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(hidden_size, input_size),
            nn.Sigmoid()
        )

    def forward(self, x):
        x = x.transpose(1, 2)
        x = self.pre_rnn_conv(x.transpose(1, 2)).transpose(1, 2)
        out, _ = self.gru(x)
        out = self.decoder(out)
        return out.transpose(1, 2)