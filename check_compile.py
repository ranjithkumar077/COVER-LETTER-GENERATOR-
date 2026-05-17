import os, py_compile, sys
root = os.path.abspath(os.path.dirname(__file__))
errors = []
for dirpath, _, filenames in os.walk(root):
    for f in filenames:
        if f.endswith('.py'):
            path = os.path.join(dirpath, f)
            try:
                py_compile.compile(path, doraise=True)
            except Exception as e:
                errors.append((path, e))
if errors:
    for p, e in errors:
        print('ERROR:', p, '->', e)
    sys.exit(1)
else:
    print('All Python files compile successfully')
