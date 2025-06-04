export default function getAvatar(userName: string): MediaStreamTrack {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200
    canvas.height = 675
    if(!ctx) {
        throw new Error('Unpredictable behavior')
    }


    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 100px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const initials = getInitials(userName)
    ctx.fillText(initials, canvas.width / 2, canvas.height / 2);

    const stream = canvas.captureStream(1);
    return stream.getVideoTracks()[0];
}

function getInitials(userName: string): string {
    const cleaned = userName.trim()
    const allSpaces = cleaned.split(' ')
    if(allSpaces.length === 1) {
        return `${allSpaces[0][0]}${allSpaces[0][1]}`;
    }

    if(allSpaces.length === 2) {
        return `${allSpaces[0][0]}${allSpaces[1][0]}`;
    }

    return `${allSpaces[0][0]}${allSpaces[1][0]}${allSpaces[2][0]}`;
}