document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('mathCanvas');
    const ctx = canvas.getContext('2d');
    
    const colorPicker = document.getElementById('colorPicker');
    const penBtn = document.getElementById('penBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const clearBtn = document.getElementById('clearBtn');

    let isDrawing = false;
    let isEraser = false;
    let currentX = 0;
    let currentY = 0;

    // Default styles
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = colorPicker.value;

    function startDrawing(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        currentX = (e.clientX || e.touches[0].clientX) - rect.left;
        currentY = (e.clientY || e.touches[0].clientY) - rect.top;
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault(); // prevent scrolling on touch

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(x, y);
        ctx.stroke();

        currentX = x;
        currentY = y;
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // Mouse Events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch Events
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    // Tools
    colorPicker.addEventListener('change', (e) => {
        if (!isEraser) {
            ctx.strokeStyle = e.target.value;
        }
    });

    penBtn.addEventListener('click', () => {
        isEraser = false;
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = 3;
        penBtn.classList.add('active');
        eraserBtn.classList.remove('active');
    });

    eraserBtn.addEventListener('click', () => {
        isEraser = true;
        ctx.strokeStyle = '#ffffff'; // Match canvas background
        ctx.lineWidth = 20; // Thicker eraser
        eraserBtn.classList.add('active');
        penBtn.classList.remove('active');
    });

    clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
});
