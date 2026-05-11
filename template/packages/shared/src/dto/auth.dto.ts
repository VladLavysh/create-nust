export interface ILoginDto {
  email: string
  password: string
}

export interface IRegisterDto {
  email: string
  password: string
}

export interface IAuthResponse {
  accessToken: string
  refreshToken: string
}
