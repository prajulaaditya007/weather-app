import { type ReactNode } from 'react'

type Props = {
    children: ReactNode
    title: string
}

function Card({ children, title }: Props) {
    return (
        <div className='p-4 rounded-xl bg-zinc-900 shadow-md'>
            <h2 className='text-2xl font-semibold'>{title}</h2>
            <div>{children}</div>
        </div>
    )
}

export default Card