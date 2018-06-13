
# The MACD Algorithm

## Base

- roc(period) = (data - period) / period
- macd(me1_period, me2_period) = ema(data, me1_period) - ema(data, me2_period)
- macd_signal(signal_period) = ema(macd, signal_period)
- rsi = AU / (AU + AD)

## Input

1. roc = roc(240)
2. long_roc = roc(480)
3. macd
4. rsi

## Algorithms

### Buy at bull

if
```
And(roc > 0, macd > 0, Or(rsi < 25, Crossover(macd, macd_signal))
```
then buy security (50% limit)


### Buy at bull - negative macd (Not Sure)

if
```
And(roc > 0, macd < 0, Or(rsi < 25, Crossover(macd, macd_signal))
```
then buy security (25% limit)


### Close at negative macd

if
```
And(macd < 0, Or(rsi > 75, Crossover(macd_signal, macd))
```
then sell all securities


### Close at bull

if
```
And(roc > 0, macd > 0, Or(rsi > 75, Crossover(macd_signal, macd))
```
then sell all 50% of security


### Profit cut

P = 20
if longroc < 0 and current price is P% over the avg position, then sell all securities

### Loss cut

P(A) = 6
P(B) = 3
if longroc > 0 and current price is P(A)% under the avg position, then sell all securities
if longroc < 0 and current price is P(B)% under the avg position, then sell all securities
