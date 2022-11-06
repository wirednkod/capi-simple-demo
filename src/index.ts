/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import "regenerator-runtime/runtime"
import UI, { emojis } from "./view"
import * as C from "capi"
import { SystemHealth } from "capi/types/known/types/common"

interface Block {
  block: {
      justifications: any;
      block: {
          header: any;
          extrinsics: any;
      };
  };
}

window.onload = () => {
  const loadTime = performance.now()
  const ui = new UI({ containerId: "messages" }, { loadTime })
  ui.showSyncing()
  void (async () => {
    try {
      const currentBlock = await C.readBlock(C.westend).run()
      // (currentBlock).block.block.header.number)
      ui.showSynced()
      ui.log(`${emojis.seedling} Chain is ready (powered by CAPI) - Reading at block #${parseInt((currentBlock as Block).block.block.header.number,0)}`, true)
      const chainName = await C.rpcCall(C.westend, "system_chain", []).select("result").run();
      const health = await C.rpcCall(C.westend, "system_health", []).select("result").run();
      const genesisHash = await C.rpcCall(C.westend, "chain_getBlockHash", [0]).select("result").run();
      ui.log(`${emojis.info} Connected to ${chainName} with ${(health as SystemHealth).peers} peers.`)
      ui.log(`${emojis.chequeredFlag} Genesis hash is ${genesisHash}`,)
      ui.log(`${emojis.newspaper} Subscribing to new block headers`)

      const rpc = C.rpcSubscription(C.westend, "chain_subscribeNewHead", [], () =>
      (m) =>
        ui.log(`${emojis.brick} New block #${parseInt(m.params.result.number,0)} has hash ${m.params.result.parentHash}`)
      );
      await C.run(rpc)
    } catch (error) {
      ui.error(<Error>error)
    }
  })()
}