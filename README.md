# D2 Mod Wiki Generator

A comprehensive static site generator for Diablo 2 mod wikis with authentic property formatting and D2 data integration.

## 🌐 Live Demo

**[View the Generated Wiki](https://galygious.github.io/DiabloModWiki/)**

Experience the enhanced D2 mod wiki with:
- 814 unique items with authentic D2 property formatting
- 2540 set items with progressive bonuses
- 373 skills with detailed information
- Complete D2 lookup chain integration

## ✨ Features

### 🎯 **Authentic D2 Property Formatting**
- **Complete D2 Lookup Chain**: `property code` → `Properties.json` → `ItemStatCost.json` → `item-modifiers.json`
- **All 28 DescFunc Functions**: Proper skill formatting, resistance logic, class-specific bonuses
- **Enhanced Property Display**: `dmg%` → "+50% Enhanced Damage", `cast1` → "+20% Faster Cast Rate"
- **Resistance Combination Logic**: Shows "All Resistances +15%" when appropriate

### 🛡️ **Advanced Set Systems**
- **Progressive Set Bonuses**: 2-piece, 3-piece, full set bonuses
- **Unified Set Displays**: Complete set information with individual piece properties
- **Priority-Based Ordering**: Using authentic D2 stat priorities

### 🔧 **Developer Features**
- **CLI Tool**: Easy-to-use command line interface
- **TypeScript**: Full type safety and modern development
- **Modular Parsers**: Support for all D2 data file formats
- **Dark Theme**: Authentic D2-inspired styling

## 🚀 Quick Start

### Installation

```bash
npm install -g d2-mod-wiki-generator
```

### Generate a Wiki

```bash
# Generate from mod directory
d2-wiki generate "path/to/your/mod" --output docs --force

# With verbose logging
d2-wiki generate "path/to/your/mod" --verbose

# Custom theme and site name
d2-wiki generate "path/to/your/mod" --theme dark --site-name "My Awesome Mod"
```

### Serve Locally

```bash
# Serve the generated wiki
npx serve docs -p 3000
```

## 📊 Sample Output

The included sample mod demonstrates:

- **814 Unique Items** with enhanced D2 formatting
- **2540 Set Items** with complete set bonus information  
- **373 Skills** with authentic descriptions
- **Monsters, Gems, and More** - Complete mod coverage

## 🛠️ Advanced Usage

### CLI Options

```bash
d2-wiki generate <mod-path> [options]

Options:
  -o, --output <path>     Output directory (default: "./docs")
  -n, --site-name <name>  Override site name
  -t, --theme <theme>     Theme: dark|light|auto (default: "dark")
  -v, --verbose           Enable verbose logging
  -f, --force             Force overwrite existing files
  --skip-validation       Skip data validation
```

### Supported Data Files

- **Items**: `uniqueitems.txt`, `setitems.txt`, `sets.txt`, `armor.txt`, `weapons.txt`
- **Skills**: `skills.txt`, `skilldesc.txt`
- **Monsters**: `monstats.txt`, `monsters.json`
- **Localization**: `item-names.json`, `skill-names.json`
- **Reference Data**: Complete D2 lookup tables

## 🎮 Property Formatting Examples

### Before (Raw Properties)
```
dmg%: 50-90
cast1: 20
res-all: 15
ama: 2
```

### After (Enhanced D2 Formatting)
```
+50-90% Enhanced Damage
+20% Faster Cast Rate
All Resistances +15%
+2 to Amazon Skill Levels
```

## 🔧 Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/Galygious/DiabloModWiki.git
cd DiabloModWiki

# Install dependencies
npm install

# Build the project
npm run build

# Test with sample mod
node dist/cli/index.js generate "Sample Mods/RandoFun4/RandoFun4.mpq" --force --verbose
```

### Project Structure

```
src/
├── cli/                 # Command line interface
├── parsers/            # Data file parsers
├── types/              # TypeScript type definitions
└── data/               # D2 reference data

docs/                   # Generated wiki output (GitHub Pages)
Sample Mods/           # Sample mod data for testing
```

## 📈 Roadmap

- [x] **Enhanced D2 Property Formatting** - Complete D2 lookup chain
- [x] **Set Bonus Systems** - Progressive bonuses and unified displays  
- [x] **CLI Tool** - Easy-to-use command line interface
- [x] **GitHub Pages Integration** - Live demo hosting
- [ ] **Rune Words Support** - Complete rune word formatting
- [ ] **Cube Recipes** - Recipe display and search
- [ ] **Interactive Features** - Search, filtering, comparisons
- [ ] **Multiple Themes** - Light theme and customization options

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built for the Diablo 2 modding community
- Inspired by authentic D2 property formatting
- Uses comprehensive D2 data reference files

---

**[🌐 Live Demo](https://galygious.github.io/DiabloModWiki/)** | **[📁 GitHub Repository](https://github.com/Galygious/DiabloModWiki)** 