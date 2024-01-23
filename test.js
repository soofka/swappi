function a(a, ...args) {
    b(a, args);
}

function b(b, args) {
    console.log(b, ...args);
}

a('a', 'b', 'c', 'd');