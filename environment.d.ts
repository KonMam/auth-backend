declare namespace NodeJS {
      interface ProcessEnv {
        HOST: string;
        PORT: string;
        PWD: string;
        USER_NAME: string;
        DB_NAME: string;
      }
    }

export {}