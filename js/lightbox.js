document.addEventListener('DOMContentLoaded', function () {
    // Create lightbox elements
    var lightbox = document.createElement('div');
    lightbox.id = 'lightbox-overlay';
    
    var lightboxImg = document.createElement('img');
    lightboxImg.id = 'lightbox-image';
    
    lightbox.appendChild(lightboxImg);
    document.body.appendChild(lightbox);

    // State variables
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    
    // Touch handling variables
    let initialDistance = 0;
    let initialScale = 1;

    function updateTransform() {
        lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    function resetState() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
    }

    // Select all images in content
    var images = document.querySelectorAll('.hd img');
    
    images.forEach(function (img) {
        // Skip if image is the lightbox image itself (just in case)
        if (img.id === 'lightbox-image') return;
        
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', function (e) {
            e.stopPropagation();
            lightboxImg.src = this.src;
            lightbox.classList.add('active');
            resetState();
        });
    });

    // Close lightbox when clicking on the overlay
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });

    // --- Desktop: Wheel Zoom ---
    lightbox.addEventListener('wheel', function (e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.max(0.5, Math.min(5, scale + delta));
        
        if (newScale !== scale) {
            scale = newScale;
            updateTransform();
        }
    }, { passive: false });

    // --- Desktop: Mouse Drag ---
    lightboxImg.addEventListener('mousedown', function (e) {
        e.preventDefault();
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        lightboxImg.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        e.preventDefault();
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
    });

    window.addEventListener('mouseup', function () {
        if (isDragging) {
            isDragging = false;
            lightboxImg.style.cursor = 'grab';
        }
    });

    // --- Mobile: Touch Gestures ---
    
    // Helper to calculate distance between two fingers
    function getDistance(touches) {
        return Math.hypot(
            touches[0].pageX - touches[1].pageX,
            touches[0].pageY - touches[1].pageY
        );
    }

    lightboxImg.addEventListener('touchstart', function (e) {
        if (e.touches.length === 1) {
            // Single finger drag
            isDragging = true;
            startX = e.touches[0].pageX - translateX;
            startY = e.touches[0].pageY - translateY;
        } else if (e.touches.length === 2) {
            // Two finger zoom
            isDragging = false; // Stop dragging when zooming
            initialDistance = getDistance(e.touches);
            initialScale = scale;
        }
    }, { passive: false });

    lightboxImg.addEventListener('touchmove', function (e) {
        e.preventDefault(); // Prevent default scrolling
        
        if (e.touches.length === 1 && isDragging) {
            // Dragging
            translateX = e.touches[0].pageX - startX;
            translateY = e.touches[0].pageY - startY;
            updateTransform();
        } else if (e.touches.length === 2) {
            // Pinch Zooming
            const currentDistance = getDistance(e.touches);
            if (initialDistance > 0) {
                const diff = currentDistance / initialDistance;
                scale = Math.max(0.5, Math.min(5, initialScale * diff));
                updateTransform();
            }
        }
    }, { passive: false });

    lightboxImg.addEventListener('touchend', function (e) {
        if (e.touches.length < 2) {
            initialDistance = 0;
        }
        if (e.touches.length === 0) {
            isDragging = false;
        }
    });
});
