export const parseLaravelErrors = (error) => {
    if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        return Object.values(errors).flat().join('\n');
    }

    if (error?.response?.data?.message) {
        return error.response.data.message;
    }

    return 'Bir hata oluştu. Lütfen bilgilerinizi kontrol edin.';
};
