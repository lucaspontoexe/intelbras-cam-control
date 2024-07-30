import { md5 } from "js-md5";

enum conn_status {
  disconnected,
  connecting,
  connected,
}

type RPCRequest = {
  method: string;
  // ideia: template param pra não usar unknown
  params: Record<string, unknown> | null;
};

const json_headers = {
  accept: "application/json, text/javascript, */*; q=0.01",
  "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
};

export class Camera {
  host: string;
  username: string;
  password: string;

  private requestID = 0;
  private session = "";
  private cookie = "";

  connectionStatus = conn_status.disconnected;

  zoom = 0;
  focus = 0;

  constructor(host: string, username: string, password: string) {
    this.host = host;
    this.username = username;
    this.password = password;
  }

  async init() {
    await this.login();
    await this.sendRPC({ method: "devVideoInput.getFocusStatus", params: null })
      .then((response) => {
        this.zoom = response.params.status.Zoom;
        this.focus = response.params.status.Focus;
      });
  }

  async login() {
    if (this.connectionStatus !== conn_status.disconnected) return;
    this.connectionStatus = conn_status.connecting;
    let params: { random: string; realm: string };

    try {
      console.log("[camera] login");
      const response = await fetch(this.host + "RPC2_Login", {
        headers: {
          ...json_headers,
          cookie: `username=${this.username}; secure`,
          referer: this.host,
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: JSON.stringify({
          method: "global.login",
          params: {
            userName: this.username,
            password: "",
            clientType: "Web3.0",
            loginType: "Direct",
          },
          id: ++this.requestID,
        }),
        method: "POST",
      }).then((r) => r.json());
      this.session = response.session;
      params = response.params;
    } catch (error) {
      console.error("[camera] login error\n", error);
      this.connectionStatus = conn_status.disconnected;
      // TODO: se o erro não for EHOSTUNREACH, tentar de novo
      return;
    }

    // login parte 2
    function makeHash(...input: string[]) {
      const hex_md5 = (str: string) => md5(str).toUpperCase();
      return hex_md5(input.join(":"));
    }

    const passwordHash = makeHash(
      this.username,
      params.random,
      makeHash(this.username, params.realm, this.password),
    );

    const login2 = await fetch(this.host + "RPC2_Login", {
      headers: json_headers,
      referrer: this.host,
      body: JSON.stringify({
        method: "global.login",
        params: {
          userName: this.username,
          password: passwordHash,
          clientType: "Web3.0",
          loginType: "Direct",
          authorityType: "Default",
        },
        id: ++this.requestID,
        session: this.session,
      }),
    }).then((r) => r.json());

    this.cookie =
      `secure; DhWebClientSessionID=${this.session}; username=${this.username};`;

    await fetch(this.host + "RPC2_Notify_Method", {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        cookie: this.cookie,
        Referer: this.host,
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    });

    this.connectionStatus = conn_status.connected;

    setInterval(this.keepAlive, 300 * 1000);
  }

  private keepAlive() {
    // post keepalive
    this.sendRPC({
      method: "global.keepAlive",
      params: { timeout: 300, active: true },
    });
  }

  getStatus() {
    console.error("getFocusStatus not implemented");
    // ideia: usar getters/setters pra definir valores
    // vai depender do front-end também
  }

  async sendRPC(body: RPCRequest) {
    if (this.connectionStatus == conn_status.disconnected) await this.login();
    if (this.connectionStatus == conn_status.connecting) return;

    let response;
    try {
      response = await fetch(this.host + "RPC2", {
        headers: json_headers,
        referrer: this.host,
        body: JSON.stringify({
          ...body,
          id: ++this.requestID,
          session: this.session,
          cookie: this.cookie,
        }),
        method: "POST",
      }).then((r) => r.json());
    } catch (error) {
      console.error("RPC error\n", error);
    }

    if (!response?.result) {
      // câmera caiu
      this.connectionStatus = conn_status.disconnected;
      await this.login();
      // debate: tentar repetir o request depois do login?
    }

    return response;
  }
}
