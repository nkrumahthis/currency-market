# TODO

one command setup
high level architectural choices and why
clean, easy to follow code and readme.
    - how to spin it up
    - description
    why express, nextjs, prisma, why monorepo
    dependency inversion, dependency injection

Layers
-------
routes should only deal with requests, headers and responses.
don't do validation, database calls in routes
never call repositories outside a repository

middleware for validation

my layers
- routes
- service
- repository

write tests

draw a diagram (miro, excalidraw)

clearly state why you use actions: cors and env vars

improvements
-----

use next /api as proxy

use database transactions when making trades

wrap the uploader into an uploader interface and depend on the interface

validate