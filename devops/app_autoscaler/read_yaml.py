#!/usr/bin/env python3

import sys, json, yaml, os

filename = sys.argv[1]
with open(filename) as f:
    values = yaml.load(f)

def get_from_dict(values, keys):
    if len(keys) > 1:
        return get_from_dict(values[keys[0]], keys[1:])
    else:
        return values[keys[0]]

print(get_from_dict(values, sys.argv[2:]))
