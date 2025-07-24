
export function validatePhone (phone) {
    const regexp = /^(([0-9\ \+\_\-\,\.\^\*\?\$\^\#\(\)])|(ext|x)){1,20}$/;
    return regexp.test(phone);
}