const loadingNewImageInDatabase = async () => {
    const texturesPath = path.join(process.cwd(), '/./public/mc_textures');
    let availableTextures;
    try {
        const files = await fs.promises.readdir(texturesPath);
        availableTextures = files.filter(file => path.extname(file).toLowerCase() === '.webp');
        console.log(availableTextures);

        availableTextures.forEach(async (textureFileName) =>  {
            const filePath = path.join(texturesPath, textureFileName);
            const dataFile = await fs.promises.readFile(filePath);
            let texture = dataFile.toString('base64');

            setNewTextureInDatabase(texture, textureFileName.replaceAll('.webp', ''));
        });
    } catch (error) {
        console.error('Error reading mc_textures directory:', error);
        availableTextures = [];
    }
};

const setNewTextureInDatabase = async (texture, shortName) => {
    let newTexture = {
        name: shortName.replaceAll('_', ' '),
        texture
    };
    const curDoc = await ImageCollection.findOne({ name: newTexture.name });
    if (curDoc?.name && curDoc?.texture !== newTexture?.texture) {
        await ImageCollection.updateOne({ name: newTexture.name }, { $set: { texture: newTexture.texture } });
        console.log(`Texture find and updated`)
    } else if (!curDoc?.name) {
        await ImageCollection.insertOne(newTexture);
        console.log(`Texture for added`)
    } else {
        console.log(`Texture is already in the database`)
    }
};

export { loadingNewImageInDatabase, setNewTextureInDatabase }