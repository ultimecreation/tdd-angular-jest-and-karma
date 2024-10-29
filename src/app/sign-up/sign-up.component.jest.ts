import { render, screen, waitFor } from '@testing-library/angular'
import { SignUpComponent } from './sign-up.component'
import userEvent from '@testing-library/user-event'
import 'whatwg-fetch'
import { HttpClientModule } from '@angular/common/http'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { SharedModule } from '../shared/shared.module'
import { ReactiveFormsModule } from '@angular/forms'

type UniqueEmailCheck = {
    email: string
}
let reqBody: any
let reqCounter = 0
const server = setupServer(
    rest.post("/api/1.0/users", (req, res, ctx) => {
        reqBody = req.body
        reqCounter += 1
        return res(ctx.status(200), ctx.json({}))
    }),
    rest.post("/api/1.0/user/email", (req, res, ctx) => {
        const body = req.body as UniqueEmailCheck
        if (body.email === 'non-unique-email@mail.com') {
            return res(ctx.status(200), ctx.json({}))
        }

        return res(ctx.status(404), ctx.json({}))
    }),

)
beforeEach(() => {
    reqCounter = 0
    server.resetHandlers()
})

beforeAll(() => server.listen())
afterAll(() => server.close())
const setup = async () => {
    await render(SignUpComponent, {
        imports: [HttpClientModule, SharedModule, ReactiveFormsModule]
    })
}
describe('Signup component', () => {
    describe('Layout', () => {
        it('has signup header', async () => {
            await setup()
            const h1 = screen.getByRole('heading', { name: 'Sign up', level: 1 })
            expect(h1).toBeInTheDocument()
        })
        it('has username input', async () => {
            await setup()
            const usernameInput = screen.getByLabelText('Username')
            expect(usernameInput).toBeInTheDocument()
        })
        it('has email input', async () => {
            await setup()
            const emailInput = screen.getByLabelText('Email')
            expect(emailInput).toBeInTheDocument()
        })
        it('has password input', async () => {
            await setup()
            const passwordInput = screen.getByLabelText('Password')
            expect(passwordInput).toBeInTheDocument()
            expect(passwordInput).toHaveAttribute('type', 'password')
        })
        it('has passwordRepeat input', async () => {
            await setup()
            const passwordRepeatInput = screen.getByLabelText('Password Repeat')
            expect(passwordRepeatInput).toBeInTheDocument()
            expect(passwordRepeatInput).toHaveAttribute('type', 'password')
        })
        it('has submit button input and button is disabled', async () => {
            await setup()
            const submitBtn = screen.getByRole('button', { name: 'Sign up' })
            expect(submitBtn).toBeInTheDocument()
            expect(submitBtn).toBeDisabled()
        })
    })

    describe('Interactions', () => {
        let button: any

        const setupForm = async () => {
            await setup()

            const usernameInput = screen.getByLabelText('Username')
            const emailInput = screen.getByLabelText('Email')
            const passwordInput = screen.getByLabelText('Password')
            const passwordRepeatInput = screen.getByLabelText('Password Repeat')
            button = screen.getByRole('button', { name: 'Sign up' })

            await userEvent.type(usernameInput, 'My username')
            await userEvent.type(emailInput, 'test@mail.com')
            await userEvent.type(passwordInput, 'Password')
            await userEvent.type(passwordRepeatInput, 'Password')

        }
        it('enables the button when the password and password-repeat fields are filled', async () => {
            await setupForm()
            await waitFor(() => {
                expect(button).toBeEnabled()

            })

        })
        it('send username,email,password to the backend on form submission', async () => {
            await setupForm()
            await userEvent.click(button)
            await waitFor(() => {
                expect(reqBody).toEqual({
                    username: "My username",
                    email: "test@mail.com",
                    password: "Password"
                })
            })

        })

        it('displays spinner when api request is send', async () => {
            await setupForm()
            await userEvent.click(button)
            await userEvent.click(button)
            await waitFor(() => {
                expect(reqCounter).toBe(1)
            })

        })

        it('does displays spinner when no api request is send', async () => {
            await setupForm()
            expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument()
            userEvent.click(button)
            await waitFor(() => {
                expect(screen.queryByRole('status', { hidden: true })).toBeInTheDocument()

            })
        })

        it('displays signup success notification on registration success', async () => {
            await setupForm()
            expect(screen.queryByText('Please check your email to activate your account')).not.toBeInTheDocument()

            userEvent.click(button)
            await waitFor(() => {
                expect(screen.queryByText('Please check your email to activate your account')).toBeInTheDocument()
            })


        })

        it('hides the form on registration success', async () => {

            await setupForm()
            expect(screen.getByRole('form')).toBeInTheDocument()
            userEvent.click(button)
            await waitFor(() => {
                expect(screen.queryByRole('form')).not.toBeInTheDocument()

            })

        })

        it('displays validation error from backend after submit failure', async () => {
            server.use(
                rest.post("/api/1.0/users", (req, res, ctx) => {
                    return res(ctx.status(400), ctx.json({
                        validationErrors: { email: "Email in use" }
                    }))
                })
            )
            await setupForm()
            await userEvent.click(button)
            const errorMsg = await screen.findByText("Email in use")

            expect(errorMsg).toBeInTheDocument()


        })
    })

    describe('Validation', () => {
        it.each`
          field                | value                          | error
          ${'Username'}        | ${'{space}{backspace}'}        | ${'Username is required'}
          ${'Username'}        | ${'123'}                       | ${'Username must be at least 4 characters'}
          ${'Email'}           | ${'{space}{backspace}'}        | ${'Email is required'}
          ${'Email'}           | ${'invalid-format'}            | ${'Invalid email address'}
          ${'Email'}           | ${'non-unique-email@mail.com'} | ${'Email in use'}
          ${'Password'}        | ${'{space}{backspace}'}        | ${'Password is required'}
          ${'Password Repeat'} | ${'pass'}                      | ${'Passwords do not match'}
        `(
            `displays $error when $field has "$value" `,
            async ({ field, value, error }) => {
                await setup();
                expect(screen.queryByText(error)).not.toBeInTheDocument();

                const input = screen.getByLabelText(field);
                await userEvent.type(input, value);
                await userEvent.tab();
                expect(await screen.findByText(error)).toBeInTheDocument();
            }
        );

    })

})

