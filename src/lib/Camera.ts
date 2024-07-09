export class Camera {
  host: string;
  username: string;
  password: string;
  
  private requestID = 0;
  private session = "";
  private cookie = "";
  
  constructor(host: string, username: string, password: string) {
    this.host = host;
    this.username = username;
    this.password = password;
  }

  private makeHash(...input: string[]) {
        console.error('makehash not implemented');
        return (input.join(":"));
  }

  getStatus() {
    console.error('getFocusStatus not implemented');
  }
}
