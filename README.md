# bc-247-hospitality (Albergo Pacifica)

AEM Sites project using **Universal Editor** for content authoring and **Edge Delivery Services** for high-performance publishing.

## Important URLs

- **Preview**: https://main--bc-247-hospitality--sridharjayakumar.aem.page/
- **Live**: https://main--bc-247-hospitality--sridharjayakumar.aem.live/
- **GitHub Repository**: https://github.com/sridharjayakumar/bc-247-hospitality
- **AEM Author**: https://author-p34810-e2076638.adobeaemcloud.com/
- **Content Path**: `/content/albergo-pacifica/`

## Project Overview

This is a hospitality-themed website built on Adobe's **AEM Boilerplate** template, leveraging:

- **AEM as a Cloud Service** for content management
- **Universal Editor** for WYSIWYG visual authoring
- **Edge Delivery Services** for CDN-optimized delivery
- **Block-based architecture** for modular components


### Universal Editor Authoring

- **What it is**: Content authored in AEM's visual WYSIWYG editor
- **Tools**: AEM Author interface, Universal Editor
- **Interface**: AEM Cloud Service author instance
- **Configuration**: `fstab.yaml` points to AEM author instance
- **Use case**: Teams that need enterprise CMS features and governance

### Correct URLs for Content Authoring

**To edit content, use:**
- **AEM Author**: https://author-p34810-e2076638.adobeaemcloud.com/
- Navigate to: `/content/albergo-pacifica/`
- Open pages in Universal Editor

## Quick Start

### Prerequisites

- Node.js 18.3.x or newer
- AEM Cloud Service access (release 2024.8+)
- AEM CLI: `npm install -g @adobe/aem-cli`

### Local Development

```bash
# Install dependencies
npm install

# Start local development server
aem up

# Opens http://localhost:3000
# Proxies content from AEM author instance
# Hot-reloads on file changes
```

### Content Authoring

1. Log in to AEM Author: https://author-p34810-e2076638.adobeaemcloud.com/
2. Navigate to **Sites** > `/content/albergo-pacifica/`
3. Select a page and open in **Universal Editor**
4. Edit content visually with inline editing
5. Save changes (auto-saved to AEM)

### Publishing Content

1. In AEM Sites console, select page(s)
2. Click **Quick Publish**
3. Content appears at:
   - Preview: https://main--bc-247-hospitality--sridharjayakumar.aem.page/
   - Live: https://main--bc-247-hospitality--sridharjayakumar.aem.live/

### Code Deployment

1. Make code changes locally (blocks, scripts, styles)
2. Test with `aem up`
3. Commit and push to `main` branch
4. **AEM Code Sync bot** auto-deploys to edge
5. Changes reflect on aem.page/aem.live within minutes

## Project Structure

```
/
├── blocks/                 # Block components
│   ├── cards/
│   ├── hero/
│   ├── columns/
│   ├── fragment/
│   ├── header/
│   └── footer/
├── scripts/
│   ├── aem.js             # Franklin core library
│   ├── scripts.js         # Site initialization
│   ├── editor-support.js  # Universal Editor integration
│   └── editor-support-rte.js
├── styles/
│   ├── styles.css         # Global styles
│   ├── fonts.css
│   └── lazy-styles.css
├── models/                # Component models
│   └── _*.json
├── fstab.yaml            # Content mount configuration
├── paths.json            # Content path mappings
├── component-*.json      # Generated (don't edit directly)
├── CLAUDE.md             # Detailed technical documentation
└── README.md             # This file
```

## Available Blocks

- **Cards** - Grid of card items with images and text
- **Hero** - Hero banner with background image and content
- **Columns** - Multi-column layouts (2, 3, 4 columns)
- **Fragment** - Embedded content from other pages
- **Header** - Site navigation
- **Footer** - Site footer

## Common Tasks

### Linting

```bash
# Lint JavaScript and CSS
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Building Component Configs

After modifying component models:

```bash
npm run build:json
```

This merges `/models/_*.json` and `/blocks/*/_*.json` into root-level component configuration files.

## Key Configuration Files

### `fstab.yaml`
Mounts AEM author content to your site:
```yaml
mountpoints:
  /:
    url: "https://author-p34810-e2076638.adobeaemcloud.com/bin/franklin.delivery/sridharjayakumar/bc-247-hospitality/main"
    type: "markup"
    suffix: ".html"
```

### `paths.json`
Maps AEM content paths to site URLs:
```json
{
  "mappings": ["/content/albergo-pacifica/:/"],
  "includes": ["/content/albergo-pacifica/"]
}
```

### Component Configuration
- `component-definition.json` - Components available in Universal Editor
- `component-models.json` - Field definitions for authoring forms
- `component-filters.json` - Component nesting rules

**Note**: These are auto-generated. Edit source files in `/models/` and `/blocks/*/` instead.

## Styling

Uses CSS variables defined in `:root` (styles/styles.css):

- Colors: `--background-color`, `--text-color`, `--link-color`
- Fonts: `--body-font-family`, `--heading-font-family`
- Sizes: `--body-font-size-*`, `--heading-font-size-*`

Responsive breakpoint: **900px** (desktop)

## Documentation

### External Resources
- [AEM Universal Editor Tutorial](https://www.aem.live/developer/ue-tutorial) - Setup guide (used for this project)
- [Edge Delivery Documentation](https://www.aem.live/docs/)
- [Universal Editor Authoring](https://www.aem.live/docs/aem-authoring)
- [Block Creation Guide](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/create-block)
- [Content Modeling Guide](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/content-modeling)

### Understanding Authoring Approaches
- [Edge Delivery Overview](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/overview) - Explains both authoring methods
- [Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project) - Project structure and mounting

## License

Apache License 2.0

See [LICENSE](./LICENSE) file for details.

## Support

- **Issues**: https://github.com/sridharjayakumar/bc-247-hospitality/issues
- **AEM Community**: https://experienceleaguecommunities.adobe.com/
- **Discord**: Join the AEM community Discord for real-time help