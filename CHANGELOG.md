# Unreleased

- Fix example

# 0.3.2

- Fix sourcemap generation when exporting external css ([#13](https://github.com/EMH333/esbuild-svelte/issues/13))
- Update Svelte to 3.31.0

# 0.3.1

- Fix path resolution for Windows when exporting css to external files (Thanks [@markoboy](https://github.com/EMH333/esbuild-svelte/pull/8))

    This is already covered by tests (when running on Windows) but I'm not going to run CI on Windows. If it continues to be a problem, I will add explict tests but I don't see that becoming the case.

- Add esbuild as peer dependency
- Update Svelte to 3.29.7

# 0.3.0 

- **(Breaking)** Support separate CSS output stream

    No more CSS in JS, yay! If for whatever reason this doesn't work, then just set the `css` compilerOption to `true` and it will revert to the previous behavior. 
    
    In order to implement this, I created a fake file extension loader then set those files to be imported from the js code emited. A map acts as storage between the loaders. I'm not 100% happy with this system because it feels brittle and incomplete but it will work for now. If you have suggestions for how I could do this better, I am all ears!

# 0.2.1

- Fix preprocessor support, currently considered unstable until I test it with some of my personal projects
- Update README because I forgot that I added preprocessor support

# 0.2.0

- Add some simple smoke tests
- Add Github CI
- Add Dependabot
- Fix `configurable` so it actually works now (also add *a bit* of test coverage so it won't happen again)
- Add typescript types to `configurable` preping for eventual conversion to typescript for development
- Add .npmignore

# 0.1.1

- Format some files
- Update README to reflect the release of the plugin API

# 0.1.0

- Update to esbuild API version 0.8.1
- Add Svelte compiler configuration options
- Fix error/warning reporting from Svelte
 
# 0.0.4

- Add publishing workflow to reduce mistakes in the future

# 0.0.3

- Update example
- Correct module export
- Update README

# 0.0.2

- Actually export the plugin for use :)
