// D2 Mod Wiki Enhanced JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('D2 Mod Wiki with authentic D2 formatting loaded!');
    
    // Add copy-to-clipboard for properties
    document.querySelectorAll('.property-item').forEach(property => {
        property.addEventListener('click', function() {
            navigator.clipboard.writeText(this.textContent).then(() => {
                const original = this.style.backgroundColor;
                this.style.backgroundColor = 'var(--accent-color)';
                setTimeout(() => {
                    this.style.backgroundColor = original;
                }, 200);
            });
        });
        property.title = 'Click to copy property';
    });
});