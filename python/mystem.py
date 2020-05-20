from pymystem3 import Mystem
import sys
import json

text = sys.argv[1]

m = Mystem()
lemmas = m.lemmatize(text)
print(json.dumps(m.analyze(text)))