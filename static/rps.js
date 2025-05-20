document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas');
    const result = document.getElementById('result');
    const computer_result = document.getElementById('computer-result');
    const button = document.getElementById('play-game');
    const ctx = canvas.getContext('2d');

    // Initialize camera
    function initCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream; // video element streams webcam feed
                video.onloadedmetadata = () => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                };
            })
            .catch(err => {
                console.error("Camera error: ", err);
            });
    }

    initCamera();

    // Take and analyze snapshot
    async function captureAndAnalyze() {
        ctx.setTransform(-1, 0, 0, 1, canvas.width, 0); // Flip video horizontally
        ctx.drawImage(video, 0, 0); // draw image frame on canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);// reset to deafult

        const image_data = canvas.toDataURL('image/jpeg', 0.8); //packaging image data to send to Flask API

        try {
            const response = await fetch('/rock_paper_scissors/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: image_data })
            });
            const data = await response.json();
            result.textContent = `${data.gesture}`; // For Debugging
            return data.gesture;
        } catch (error) {
            console.error('API error:', error);
            result.textContent = 'Error processing image'; // For Debugging
            return null;
        }
    }

    // Get Computer Choice
    async function getComputerChoice() {
        try {
            const response = await fetch('/rock_paper_scissors/get_computer_choice');
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            computer_result.textContent = `${data.choice}`; // For Debugging
            return data.choice;
        } catch (error) {
            console.error('Error getting data:', error);
            return null;
        }
    }

    // Game Logic
    async function definingGame() {
        const computerChoice = await getComputerChoice();
        const playerChoice = await captureAndAnalyze();

        if (!computerChoice || !playerChoice) {
            return; // Aborting if either is null
        }

        const computerScoreElement = document.getElementById('computer-score');
        const playerScoreElement = document.getElementById('player-score');
        let computerScore = parseInt(computerScoreElement.textContent, 10);
        let playerScore = parseInt(playerScoreElement.textContent, 10);

        // winning moves
        const winning_moves = {
            paper: 'rock',
            rock: 'scissors',
            scissors: 'paper'
        };

        if (playerChoice === computerChoice) {
            // Handling Draws
        } else if (winning_moves[computerChoice] === playerChoice) {
            computerScore += 1;
            computerScoreElement.textContent = computerScore;
        } else if (winning_moves[playerChoice] === computerChoice) {
            playerScore += 1;
            playerScoreElement.textContent = playerScore;
        }
    }

    // Playing a Round
    button.addEventListener('click', definingGame);
});
