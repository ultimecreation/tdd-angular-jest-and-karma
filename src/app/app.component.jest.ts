import { render, screen } from "@testing-library/angular"
import { AppComponent } from "./app.component"
import { HomeComponent } from "./home/home.component"
import { SignUpComponent } from "./sign-up/sign-up.component"
import { HttpClientModule } from "@angular/common/http"
import { SharedModule } from "./shared/shared.module"
import { ReactiveFormsModule } from "@angular/forms"
import { routes } from "./router/app-router.module"
import userEvent from "@testing-library/user-event"
import { LoginComponent } from "./login/login.component"
import { ActivateComponent } from "./activate/activate.component"
import { UserComponent } from "./user/user.component"

const setup = async (path: string) => {
    const { navigate } = await render(AppComponent, {
        declarations: [HomeComponent, SignUpComponent, LoginComponent, ActivateComponent, UserComponent],
        imports: [HttpClientModule, SharedModule, ReactiveFormsModule],
        routes: routes,
    });

    await navigate(path);
}
describe('Routing', () => {

    it.each`
      path         | pageId
      ${'/'}       | ${'home-page'}
      ${'/signup'} | ${'signup-page'}
      ${'/login'} | ${'login-page'}
      ${'/user/1'} | ${'user-page'}
      ${'/activate/1'} | ${'activation-page'}
    `('displays $page at "$path" ', async ({ path, pageId }) => {
        await setup(path)
        const page = screen.getByTestId(pageId);
        expect(page).toBeInTheDocument();
    });

    it.each`
      path         | title
      ${'/'}       | ${'Home'}
      ${'/signup'} | ${'Signup'}
      ${'/login'}  | ${'Login'}
    `(
        `should display link with title  $title for path "$path"`,
        async ({ path, title }) => {
            await setup(path);
            const link = screen.queryByRole('link', { name: title });
            expect(link).toBeInTheDocument();
        }
    );

    it.each`
      initialPath  | clickingTo  | visiblePage
      ${'/'}       | ${'Signup'} | ${'signup-page'}
      ${'/signup'} | ${'Home'}   | ${'home-page'}
      ${'/'}       | ${'Login'}  | ${'login-page'}
    `(
        `displays $visiblePage after clicking To $clickingTo`,
        async ({ initialPath, clickingTo, visiblePage }) => {
            await setup(initialPath);
            const link = screen.getByRole('link', { name: clickingTo });
            await userEvent.click(link)
            const page = screen.getByTestId(visiblePage);
            await expect(page).toBeInTheDocument();
        }
    );
})