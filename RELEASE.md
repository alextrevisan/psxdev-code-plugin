# Release Process

This document describes how to create a new release of the PS1 Development Extension.

## Automated Release Process

The extension uses GitHub Actions to automate the build and release process.

### Creating a New Release

1. Update the version number in `package.json`
2. Commit your changes
3. Create and push a new tag with the version number:

```bash
git tag v0.1.0  # Replace with your version
git push origin v0.1.0
```

4. The GitHub Action will automatically:
   - Build the extension
   - Package it as a VSIX file
   - Create a GitHub Release with the VSIX file attached

### Release Workflow Details

The workflow is defined in `.github/workflows/release.yml` and is triggered when a tag starting with 'v' is pushed to the repository.

## Manual Release Process

If you need to create a release manually:

1. Update the version number in `package.json`
2. Run the packaging script:

```bash
./package-extension.ps1
```

3. The VSIX file will be created in the root directory
4. Upload this file to a GitHub Release manually
