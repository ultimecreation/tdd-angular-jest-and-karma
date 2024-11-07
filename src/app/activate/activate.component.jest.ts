import { render, screen, waitFor } from "@testing-library/angular";
import { ActivateComponent } from "./activate.component";
import { Observable, Subscriber } from "rxjs";
import { AlertComponent } from "../shared/alert/alert.component";
import { HttpClientModule } from "@angular/common/http";
import { ActivatedRoute } from "@angular/router";

import { rest } from "msw";
import { setupServer } from "msw/node";

type RouteParams = {
    id: string
}
let subscriber!: Subscriber<RouteParams>
const setup = async () => {
    const observable = new Observable<RouteParams>(sub => subscriber = sub)
    await render(ActivateComponent, {
        declarations: [AlertComponent],
        imports: [HttpClientModule],
        providers: [
            { provide: ActivatedRoute, useValue: { params: observable } }
        ]
    })
}


let counter = 0
const server = setupServer(
    rest.post(`/api/1.0/users/token/:token`, (req, res, ctx) => {
        counter += 1
        if (req.params['token'] === '456') return res(ctx.status(400))
        return res(ctx.status(200), ctx.json({}))
    }),

)
beforeEach(() => {
    counter = 0
    server.resetHandlers()
})

beforeAll(() => server.listen())
afterAll(() => server.close())

describe('ActivateComponent', () => {

    it('send account activation token', async () => {
        await setup()
        subscriber.next({ id: '123' })
        await waitFor(() => {
            expect(counter).toBe(1)
        })
    });

    it('displays activation success when token is valid', async () => {
        await setup()
        subscriber.next({ id: '123' })
        const msg = await screen.findByText('Account is activated')
        expect(msg).toBeInTheDocument()
    })
    it('displays activation failure when token is invalid', async () => {
        await setup()
        subscriber.next({ id: '456' })
        const msg = await screen.findByText('Activation Failure')
        expect(msg).toBeInTheDocument()
    })
});
