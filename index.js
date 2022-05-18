import { Files, Logger, System } from 'cafe-utility'
import Wallet from 'ethereumjs-wallet'
import { rm, writeFile } from 'fs/promises'
import fetch from 'node-fetch'
import { resolve } from 'path'

const logger = Logger.create(import.meta.url)

{
    // download Darwin ARM64 Bee and add executable bit
    const response = await fetch('https://github.com/ethersphere/bee/releases/download/v1.6.0/bee-darwin-arm64')
    const buffer = Buffer.from(await response.arrayBuffer())
    await writeFile('bee', buffer)
    await System.execAsync('chmod +x bee')
}

// write config yaml with data dir and password

{
    if (await Files.existsAsync('data-dir')) {
        await rm('data-dir', { force: true, recursive: true })
    }
    await writeFile('config.yaml', `data-dir: ${resolve('data-dir')}\npassword: Test`)
    await System.execAsync('./bee init --config=config.yaml')
    const v3 = await Files.readJsonAsync('data-dir/keys/swarm.key')
    try {
        await Wallet.default.fromV3(v3, 'Test')
        logger.info('V3 wallet decrypted successfully')
    } catch (error) {
        logger.info('Failed to decrypt V3 wallet with seemingly correct password:', error.message)
    }
}

// write config yaml with data dir and pass password in argv

{
    if (await Files.existsAsync('data-dir')) {
        await rm('data-dir', { force: true, recursive: true })
    }
    await writeFile('config.yaml', `data-dir: ${resolve('data-dir')}`)
    await System.execAsync('./bee init --config=config.yaml --password=Test')
    const v3 = await Files.readJsonAsync('data-dir/keys/swarm.key')
    try {
        await Wallet.default.fromV3(v3, 'Test')
        logger.info('V3 wallet decrypted successfully')
    } catch (error) {
        logger.info('Failed to decrypt V3 wallet with seemingly correct password:', error.message)
    }
}
