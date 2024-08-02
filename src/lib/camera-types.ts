export interface RPC2Request<Params> {
    method: string;
    params: Params;
    id?: number;
    session?: string;
}

export interface RPC2Response<Params> {
    result: boolean;
    params: Params;
    error?: { code: number; message: string };
    id: number;
    session: string;
}

// test: login
// a gente não precisa sair tipando requests, né? tem mais o que fazer

interface LoginParams {
    userName: string;
    password: string;
    clientType: "Web3.0";
    loginType: "Direct";
}

export interface GetFocusStatusResponseParams {
    status: {
        Status: "Autofocus" | "Normal";
        Zoom: number;
        Focus: number;
        AutofocusPeak: 0;
        FocusMotorSteps: number;
        ZoomMotorSteps: number;
    };
}

export interface ZoomRequestParams {
    focus: number;
    zoom: number;
}

export type LoginRequest = RPC2Request<LoginParams>;
export type AdjustFocusRequest = RPC2Request<ZoomRequestParams>;
export type AdjustFocusResponse = RPC2Response<null>;
export type GetFocusStatusResponse = RPC2Response<GetFocusStatusResponseParams>;

// tem um "object": 2 no request mas nem vamos usar isso
