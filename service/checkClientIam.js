const checkClientIam = (IamClient) => {
    return new Promise(async (resolve, reject) => {
        try {
            const iamClientId = IamClient[0].iamClientId;
            const iamClientSecret = IamClient[0].iamClientSecret;
            resolve({ iamClientId: iamClientId, iamClientSecret: iamClientSecret })
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = checkClientIam