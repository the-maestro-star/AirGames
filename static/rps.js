document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas');
    const result = document.getElementById('result');
    const button = document.getElementById('button');
    const ctx = canvas.getContext('2d');
    
    // Initialize camera
    function initCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                };
            })
            .catch(err => {
                console.error("Camera error: ", err);
                
            });
    }
// Take and analyze snapshot
async function captureAndAnalyze(){
    ctx.setTransform(-1,0,0,1,canvas.width,0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1,0,0,1,0,0);

    const image_data = canvas.toDataURL('image/jpeg', 0.8);

    try{
        const response = await fetch('/rock_paper_scissors/analyze',{
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({image:image_data})
        });
        const data = await response.json();
        result.textContent = `${data.gesture}`;

    }
    catch(error){
        console.error('API error:',error);
        result.textContent = 'Error Processing image'
    }
}
button.addEventListener('click',captureAndAnalyze);
    
initCamera();
})
